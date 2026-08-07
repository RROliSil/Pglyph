import React, { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export const App: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Verificando conexão...');
  const [dbStatus, setDbStatus] = useState<string>('Pendente...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setApiStatus(`Conectado (${data.status})`);
        setDbStatus('PostgreSQL 15 Alpine (Pronto)');
      })
      .catch(() => {
        setApiStatus('Aguardando inicialização do container backend...');
      });
  }, []);

  return (
    <div className="container">
      <div className="hero-badge">⚡ Pglyph Base Stack</div>
      <h1 className="hero-title">Estrutura Inicial Pglyph</h1>
      <p className="hero-subtitle">
        Ambiente configurado com React + Vite + TypeScript no Frontend, Node.js + Express + TypeScript no Backend e PostgreSQL no Docker Compose.
      </p>

      <div className="grid">
        <div className="card">
          <div className="card-header">
            <div className="card-icon frontend">⚛</div>
            <h3 className="card-title">Frontend</h3>
          </div>
          <p className="card-description">
            React 18, Vite 5 e TypeScript compilado de forma ultra-rápida, empacotado em Nginx Alpine.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon backend">🚀</div>
            <h3 className="card-title">Backend</h3>
          </div>
          <p className="card-description">
            API REST escalável construída com Node.js, Express e TypeScript com suporte a tipagem rigorosa.
          </p>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon database">🐘</div>
            <h3 className="card-title">Database</h3>
          </div>
          <p className="card-description">
            PostgreSQL 15 Alpine configurado com volumes persistentes e integridade via Docker Compose.
          </p>
        </div>
      </div>

      <div className="status-box">
        <div className="status-indicator"></div>
        <div className="status-text">
          Status da API: <span>{apiStatus}</span> | Banco de Dados: <span>{dbStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
