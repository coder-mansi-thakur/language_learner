import React from 'react';
import Layout from '../components/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="retro-container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome to LinguaLearn</h1>
        <p>Start your language learning journey today!</p>
        {/* <div style={{ marginTop: '30px' }}>
          <a href="/ui-components" className="retro-btn">View Design System</a>
        </div> */}
      </div>
    </Layout>
  );
};

export default Home;
