import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CandidateCard from './components/CandidateCard';
import { Candidate } from './types';
import './App.css';

const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 'c1', name: 'Abimbola', votes: 0 },
  { id: 'c2', name: 'Bright', votes: 0 },
  { id: 'c3', name: 'Gbolahan', votes: 0 },
];

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4242';

const App: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(DEFAULT_CANDIDATES);

  // ✅ Fetch votes from backend
  useEffect(() => {
    fetchVotes();
  }, []);

  async function fetchVotes() {
    try {
      const res = await axios.get(`${API_BASE}/votes`);
      console.log('✅ Votes response:', res.data);
      setCandidates(res.data);
    } catch (err) {
      console.error('❌ fetchVotes error:', err);
      setCandidates(DEFAULT_CANDIDATES);
    }
  }

  // ✅ Open Paystack modal
  function openPaystack(candidateId: string, amount: number, email: string) {
    if (!window.PaystackPop) {
      alert('⚠️ Paystack script not loaded. Please add it to public/index.html.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_live_ede37dfbc95e554b96be3f098bbf0b4fdb7330f1',
      email,
      amount: amount * 100, // convert to kobo
      currency: 'NGN',
      ref: '' + Math.floor(Math.random() * 1000000000 + 1),
      metadata: {
        custom_fields: [
          { display_name: 'Candidate', variable_name: 'candidate', value: candidateId },
        ],
      },

      callback: function (response: any) {
        // ✅ Verify payment with backend
        axios.post(`${API_BASE}/verify`, { reference: response.reference, candidateId, amount })
          .then(r => {
            if (r.data.success) {
              alert('✅ Payment verified — vote recorded!');
              fetchVotes(); // refresh votes
            } else {
              alert('❌ Verification failed: ' + (r.data.message || 'unknown'));
            }
          })
          .catch(err => {
            console.error('verify error', err);
            alert('❌ Verification error, check console');
          });
      },
      onClose: function () {
        console.log('Payment window closed.');
      },
    });

    handler.openIframe();
  }

  return (
    <div className='app-container'>
      <h1>Vote by Money(GB sample for Bright)</h1>
      <p>Pick an amount, enter your email, and pay to cast votes.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {candidates.map(c => (
          <CandidateCard key={c.id} candidate={c} onVote={openPaystack} />
        ))}
      </div>
    </div>
  );
};

export default App;
