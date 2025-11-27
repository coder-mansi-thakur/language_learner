import React from 'react';
import Layout from '../components/Layout';
import '../styles/design-system.css';
import { STRINGS } from '../constants/strings';

const DesignSystem = () => {
  return (
    <Layout>
      <div className="retro-container">
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{STRINGS.DESIGN_SYSTEM.TITLE}</h1>

        <section style={{ marginBottom: '60px' }}>
          <h2>{STRINGS.DESIGN_SYSTEM.SECTIONS.COLOR_PALETTE}</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <ColorSwatch color="var(--color-cream)" name={STRINGS.DESIGN_SYSTEM.COLORS.CREAM} />
            <ColorSwatch color="var(--color-dark-brown)" name={STRINGS.DESIGN_SYSTEM.COLORS.DARK_BROWN} textColor="white" />
            <ColorSwatch color="var(--color-orange)" name={STRINGS.DESIGN_SYSTEM.COLORS.ORANGE} />
            <ColorSwatch color="var(--color-green)" name={STRINGS.DESIGN_SYSTEM.COLORS.GREEN} />
            <ColorSwatch color="var(--color-red)" name={STRINGS.DESIGN_SYSTEM.COLORS.RED} />
            <ColorSwatch color="var(--color-yellow)" name={STRINGS.DESIGN_SYSTEM.COLORS.YELLOW} />
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>{STRINGS.DESIGN_SYSTEM.SECTIONS.BUTTONS}</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button className="retro-btn">{STRINGS.DESIGN_SYSTEM.BUTTONS.PRIMARY}</button>
            <button className="retro-btn secondary">{STRINGS.DESIGN_SYSTEM.BUTTONS.SECONDARY}</button>
            <button className="retro-btn accent">{STRINGS.DESIGN_SYSTEM.BUTTONS.ACCENT}</button>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>{STRINGS.DESIGN_SYSTEM.SECTIONS.INPUTS}</h2>
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" className="retro-input" placeholder={STRINGS.DESIGN_SYSTEM.INPUTS.PLACEHOLDER_TEXT} />
            <input type="password" className="retro-input" placeholder={STRINGS.DESIGN_SYSTEM.INPUTS.PLACEHOLDER_PASSWORD} />
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>{STRINGS.DESIGN_SYSTEM.SECTIONS.CARDS_WINDOWS}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            {/* Simple Card */}
            <div className="retro-card">
              <h3>{STRINGS.DESIGN_SYSTEM.CARDS.SIMPLE_TITLE}</h3>
              <p>{STRINGS.DESIGN_SYSTEM.CARDS.SIMPLE_DESC}</p>
            </div>

            {/* Window - Green */}
            <div className="retro-window">
              <div className="retro-window-header">
                <div className="window-controls">
                  <div className="control-dot"></div>
                  <div className="control-dot"></div>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{STRINGS.DESIGN_SYSTEM.CARDS.EXPLORER_TITLE}</span>
              </div>
              <div className="retro-window-content">
                <p>{STRINGS.DESIGN_SYSTEM.CARDS.WINDOW_CONTENT}</p>
                <button className="retro-btn" style={{ marginTop: '10px', width: '100%' }}>{STRINGS.DESIGN_SYSTEM.CARDS.ACTION_BUTTON}</button>
              </div>
            </div>

            {/* Window - Orange */}
            <div className="retro-window">
              <div className="retro-window-header orange">
                <div className="window-controls">
                  <div className="control-dot"></div>
                  <div className="control-dot"></div>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{STRINGS.DESIGN_SYSTEM.CARDS.ALERT_TITLE}</span>
              </div>
              <div className="retro-window-content" style={{ textAlign: 'center' }}>
                <p><strong>{STRINGS.DESIGN_SYSTEM.CARDS.WARNING}</strong></p>
                <p>{STRINGS.DESIGN_SYSTEM.CARDS.READY_PROMPT}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                  <button className="retro-btn">{STRINGS.DESIGN_SYSTEM.CARDS.YES}</button>
                  <button className="retro-btn secondary">{STRINGS.DESIGN_SYSTEM.CARDS.NO}</button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>{STRINGS.DESIGN_SYSTEM.SECTIONS.TYPOGRAPHY}</h2>
          <div className="retro-card">
            <h1>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.H1}</h1>
            <h2>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.H2}</h2>
            <h3>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.H3}</h3>
            <p>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.BODY}<strong>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.BOLD}</strong>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.AND}<em>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.ITALIC}</em>{STRINGS.DESIGN_SYSTEM.TYPOGRAPHY.DOT}</p>
          </div>
        </section>

      </div>
    </Layout>
  );
};

const ColorSwatch = ({ color, name, textColor = 'black' }) => (
  <div style={{ 
    width: '120px', 
    height: '120px', 
    backgroundColor: color, 
    border: '3px solid var(--color-dark-brown)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px var(--color-dark-brown)',
    fontWeight: 'bold',
    color: textColor,
    textAlign: 'center',
    fontSize: '14px'
  }}>
    {name}
  </div>
);

export default DesignSystem;
