'use client';

import React, { useEffect, useState } from 'react';

interface MarketItem {
  price: number;
  supply: number;
  demand: number;
}

interface MarketState {
  [key: string]: MarketItem;
}

interface ApiResponse {
  ok: boolean;
  market: MarketState;
}

export default function EconomyPage() {
  const [market, setMarket] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarket = async () => {
    try {
      const res = await fetch('http://localhost:3001/economy/market');
      const data: ApiResponse = await res.json();
      if (data.ok) {
        setMarket(data.market);
      } else {
        setError('Failed to fetch market data');
      }
    } catch (err) {
      setError('Could not connect to Economy Backend. Is it running on port 3001?');
    } finally {
      setLoading(false);
    }
  };

  const triggerTick = async () => {
    try {
      const res = await fetch('http://localhost:3001/economy/tick', { method: 'POST' });
      const data: ApiResponse = await res.json();
      if (data.ok) {
        setMarket(data.market);
      }
    } catch (err) {
      alert('Tick failed: ' + err);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading Market Data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!market) return <div>No market data available.</div>;

  return (
    <main className="economy-container">
      <section className="hero">
        <div className="eyebrow">Global Exchange</div>
        <h1>Dominion Market Nexus</h1>
        <p>Live resource pricing driven by simulation and demand.</p>
        <button className="button buttonPrimary" onClick={triggerTick}>Force Simulation Tick</button>
      </section>

      <section className="section">
        <div className="eyebrow">Market State</div>
        <h2>Live Resource Index</h2>
        <div className="grid">
          {Object.entries(market).map(([resource, data]) => (
            <article className="card" key={resource}>
              <h3>{resource}</h3>
              <div className="stat-row">
                <span className="label">Price:</span>
                <span className="value">${data.price.toFixed(2)}</span>
              </div>
              <div className="stat-row">
                <span className="label">Supply:</span>
                <span className="value">{Math.round(data.supply)}</span>
              </div>
              <div className="stat-row">
                <span className="label">Demand:</span>
                <span className="value">{Math.round(data.demand)}</span>
              </div>
              <div className="trend" style={{ color: data.demand > data.supply ? 'red' : 'green' }}>
                {data.demand > data.supply ? '▲ High Demand' : '▼ Oversupplied'}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
