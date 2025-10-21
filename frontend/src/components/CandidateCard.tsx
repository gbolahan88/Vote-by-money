import React, { useState } from 'react';
import { Candidate } from '../types';

interface Props {
  candidate: Candidate;
  onVote: (candidateId: string, amount: number, email: string) => void;
}

const AMOUNTS = [100];

const CandidateCard: React.FC<Props> = ({ candidate, onVote }) => {
  const [email, setEmail] = useState('');

  return (
    <div style={{ flex: '1 1 220px', padding: 20, borderRadius: 8, border: '1px solid #e6eef7', background: '#fff' }}>
      <div style={{ marginBottom: 10, width: 100, height: 100, border: '2px solid #bebebeff', borderRadius: 35}}>
        <h1 style={{ color: 'gray', fontSize: 20, marginTop: 35}}>+</h1>
      </div>
      <div style={{ fontWeight: 700, color: '#000' }}>{candidate.name}</div>
      <div style={{ marginTop: 8, color: '#000' }}>Total Vote(s): {candidate.votes.toLocaleString()}</div>

      <input
        type="email"
        placeholder="Enter email for receipt"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '70%', padding: 8, marginTop: 10, marginBottom: 10, borderRadius: 6, border: '1px solid #ccc' }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => {
              if (!email) { alert('Please enter your email'); return; }
              onVote(candidate.id, a, email);
            }}
            style={{ padding: '8px 12px', borderRadius: 8, border: 0, background: '#16a34a', color: '#fff', cursor: 'pointer' }}
          >
            Pay ₦{a.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CandidateCard;
