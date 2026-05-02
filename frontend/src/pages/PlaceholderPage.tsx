import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="card-minimal" style={{ padding: '2rem', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2>{title} Module</h2>
      <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>This feature is currently under construction.</p>
    </div>
  );
};

export default PlaceholderPage;
