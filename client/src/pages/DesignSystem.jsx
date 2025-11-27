import React from 'react';
import Layout from '../components/Layout';
import '../styles/design-system.css';

const DesignSystem = () => {
  return (
    <Layout>
      <div className="retro-container">
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🎨 Retro UI Design System</h1>

        <section style={{ marginBottom: '60px' }}>
          <h2>1. Color Palette</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <ColorSwatch color="var(--color-cream)" name="Cream (BG)" />
            <ColorSwatch color="var(--color-dark-brown)" name="Dark Brown" textColor="white" />
            <ColorSwatch color="var(--color-orange)" name="Orange" />
            <ColorSwatch color="var(--color-green)" name="Green" />
            <ColorSwatch color="var(--color-red)" name="Red" />
            <ColorSwatch color="var(--color-yellow)" name="Yellow" />
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>2. Buttons</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button className="retro-btn">Primary Button</button>
            <button className="retro-btn secondary">Secondary Button</button>
            <button className="retro-btn accent">Accent Button</button>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>3. Inputs</h2>
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" className="retro-input" placeholder="Type something..." />
            <input type="password" className="retro-input" placeholder="Password" />
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>4. Cards & Windows</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            {/* Simple Card */}
            <div className="retro-card">
              <h3>Simple Card</h3>
              <p>This is a basic content container with the signature hard shadow.</p>
            </div>

            {/* Window - Green */}
            <div className="retro-window">
              <div className="retro-window-header">
                <div className="window-controls">
                  <div className="control-dot"></div>
                  <div className="control-dot"></div>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>explorer.exe</span>
              </div>
              <div className="retro-window-content">
                <p>Window content goes here.</p>
                <button className="retro-btn" style={{ marginTop: '10px', width: '100%' }}>Action</button>
              </div>
            </div>

            {/* Window - Orange */}
            <div className="retro-window">
              <div className="retro-window-header orange">
                <div className="window-controls">
                  <div className="control-dot"></div>
                  <div className="control-dot"></div>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>alert.exe</span>
              </div>
              <div className="retro-window-content" style={{ textAlign: 'center' }}>
                <p><strong>Warning!</strong></p>
                <p>Are you ready to learn?</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                  <button className="retro-btn">Yes</button>
                  <button className="retro-btn secondary">No</button>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2>5. Typography</h2>
          <div className="retro-card">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <p>Body text. The quick brown fox jumps over the lazy dog. <strong>Bold text</strong> and <em>italic text</em>.</p>
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
