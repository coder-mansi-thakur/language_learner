export const Rating = {
    Again: 1,
    Hard: 2,
    Good: 3,
    Easy: 4,
};

export const State = {
    New: 0,
    Learning: 1,
    Review: 2,
    Relearning: 3,
};

export const FSRSParameters = {
    request_retention: 0.9,
    maximum_interval: 36500,
    w: [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542],
    enable_fuzz: true,
    enable_short_term: true,
    learning_steps: ["1m", "10m", "20m", "60m"],
    relearning_steps: ["1m","10m", "15m", "30m"],
};

export class FSRS {
    constructor(params) {
        this.p = params || FSRSParameters;
    }

    init_stability(g) {
        return this.p.w[g - 1];
    }

    init_difficulty(g) {
        const d = this.p.w[4] - (g - 3) * this.p.w[5];
        return Math.min(Math.max(d, 1), 10);
    }

    next_difficulty(d, g) {
        const next_d = d - this.p.w[6] * (g - 3);
        const next_d_mean_reversion = this.p.w[7] * this.init_difficulty(4) + (1 - this.p.w[7]) * next_d;
        return Math.min(Math.max(next_d_mean_reversion, 1), 10);
    }

    next_recall_stability(d, s, r, g) {
        const hard_penalty = g === 2 ? this.p.w[15] : 1;
        const easy_bonus = g === 4 ? this.p.w[16] : 1;
        return s * (1 + Math.exp(this.p.w[8]) *
            (11 - d) *
            Math.pow(s, -this.p.w[9]) *
            (Math.exp(this.p.w[10] * (1 - r)) - 1) *
            hard_penalty *
            easy_bonus);
    }

    next_forget_stability(d, s, r) {
        return this.p.w[11] *
            Math.pow(d, -this.p.w[12]) *
            (Math.pow(s + 1, this.p.w[13]) - 1) *
            Math.exp(this.p.w[14] * (1 - r));
    }

    next_short_term_stability(s, g) {
        return s * Math.exp(this.p.w[17] * (g - 3 + this.p.w[18]) * Math.pow(s, -this.p.w[19]));
    }

    forgetting_curve(elapsed_days, stability) {
        const factor = Math.pow(0.9, -1 / this.p.w[20]) - 1;
        return Math.pow(1 + factor * elapsed_days / stability, -this.p.w[20]);
    }

    next_interval(s) {
        const factor = Math.pow(0.9, -1 / this.p.w[20]) - 1;
        const new_interval = s / factor * (Math.pow(this.p.request_retention, -1 / this.p.w[20]) - 1);
        return Math.min(Math.max(Math.round(new_interval), 1), this.p.maximum_interval);
    }

    // Helper to parse time strings like "1m", "10m", "1d"
    parse_step(step) {
        const value = parseInt(step);
        if (step.endsWith('m')) return value / 1440; // minutes to days
        if (step.endsWith('h')) return value / 24;   // hours to days
        if (step.endsWith('d')) return value;        // days
        return value;
    }

    repeat(card, now) {
        card = { ...card };
        now = new Date(now);
        if (!card.due) card.due = now;
        if (!card.last_review) card.last_review = now;
        
        const elapsed_days = Math.max(0, (now.getTime() - new Date(card.last_review).getTime()) / (1000 * 60 * 60 * 24));
        const retrievability = this.forgetting_curve(elapsed_days, card.stability);
        
        const next_cards = {};

        for (let i = 1; i <= 4; i++) {
            const grade = i;
            let new_card = { ...card };
            new_card.last_review = now;
            new_card.reps += 1;

            if (card.state === State.New) {
                new_card.difficulty = this.init_difficulty(grade);
                new_card.stability = this.init_stability(grade);
                new_card.state = State.Learning; // Or Review if no steps? Assuming Learning for now.
                
                // Handle steps logic simply: if grade is Easy, graduate immediately?
                // For simplicity in this implementation, we'll assume standard FSRS transition
                // If we strictly follow FSRS v6 without steps:
                if (!this.p.enable_short_term) {
                     new_card.state = State.Review;
                     new_card.scheduled_days = this.next_interval(new_card.stability);
                     new_card.due = new Date(now.getTime() + new_card.scheduled_days * 24 * 60 * 60 * 1000);
                } else {
                    // Simple step logic
                    if (grade === Rating.Easy) {
                        new_card.state = State.Review;
                        new_card.scheduled_days = this.next_interval(new_card.stability);
                        new_card.due = new Date(now.getTime() + new_card.scheduled_days * 24 * 60 * 60 * 1000);
                    } else {
                        // Stay in learning or move to next step
                        // This is a simplified placeholder for step logic
                        new_card.scheduled_days = 0; // Same day
                        new_card.due = new Date(now.getTime() + 1 * 60 * 1000); // 1 min
                    }
                }
            } else if (card.state === State.Learning || card.state === State.Relearning) {
                 // Short term stability
                 new_card.stability = this.next_short_term_stability(card.stability, grade);
                 new_card.difficulty = this.next_difficulty(card.difficulty, grade);
                 
                 if (grade === Rating.Good || grade === Rating.Easy) {
                     new_card.state = State.Review;
                     new_card.scheduled_days = this.next_interval(new_card.stability);
                     new_card.due = new Date(now.getTime() + new_card.scheduled_days * 24 * 60 * 60 * 1000);
                 } else {
                     new_card.scheduled_days = 0;
                     new_card.due = new Date(now.getTime() + 5 * 60 * 1000); // 5 min
                 }
            } else if (card.state === State.Review) {
                const difficulty = this.next_difficulty(card.difficulty, grade);
                let stability = card.stability;
                
                if (grade === Rating.Again) {
                    stability = this.next_forget_stability(difficulty, stability, retrievability);
                    new_card.state = State.Relearning;
                    new_card.lapses += 1;
                    new_card.scheduled_days = 0;
                    new_card.due = new Date(now.getTime() + 5 * 60 * 1000); // 5 min
                } else {
                    stability = this.next_recall_stability(difficulty, stability, retrievability, grade);
                    new_card.scheduled_days = this.next_interval(stability);
                    new_card.due = new Date(now.getTime() + new_card.scheduled_days * 24 * 60 * 60 * 1000);
                }
                new_card.stability = stability;
                new_card.difficulty = difficulty;
            }

            next_cards[grade] = new_card;
        }

        return next_cards;
    }
}

