import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Trash2, CheckCircle2, AlertCircle, XCircle, 
  Loader2, ExternalLink, Minimize2, Maximize2, X,
  Shield, Zap, BarChart3
} from 'lucide-react';
import GmailCleanerIcon from './GmailCleanerIcon';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    unsubscribed: 0,
    deleted: 0,
    manual: 0
  });
  const [selectedResult, setSelectedResult] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await window.electronAPI.checkAuth();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.authenticate();
      if (result.success) {
        setIsAuthenticated(true);
        addLog('Autenticazione completata con successo', 'success');
      }
    } catch (error) {
      addLog('Errore durante l\'autenticazione', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const startCleaning = async () => {
    setIsLoading(true);
    setResults([]);
    setCleaningProgress(0);
    addLog('Avvio pulizia newsletter...', 'info');

    try {
      // Get all newsletter emails
      addLog('Ricerca email con link di disiscrizione...', 'info');
      const emailIds = await window.electronAPI.getNewsletters();
      addLog(`Trovate ${emailIds.length} email da analizzare`, 'info');

      // Group emails by sender
      const grouped = {};
      let processed = 0;

      for (const emailId of emailIds) {
        const metadata = await window.electronAPI.getEmailMetadata(emailId);
        const key = `${metadata.from}|||${metadata['list-unsubscribe']}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            from: metadata.from,
            listUnsubscribe: metadata['list-unsubscribe'],
            emails: []
          };
        }
        grouped[key].emails.push(emailId);
        
        processed++;
        setCleaningProgress((processed / emailIds.length) * 50);
      }

      // Process each sender group
      const groupKeys = Object.keys(grouped);
      let groupIndex = 0;

      for (const key of groupKeys) {
        const group = grouped[key];
        const result = await processNewsletterGroup(group);
        
        setResults(prev => [...prev, result]);
        groupIndex++;
        setCleaningProgress(50 + (groupIndex / groupKeys.length) * 50);
      }

      // Update stats
      const finalStats = results.reduce((acc, r) => ({
        totalEmails: acc.totalEmails + r.emailCount,
        unsubscribed: acc.unsubscribed + (r.status === 'success' ? 1 : 0),
        deleted: acc.deleted + r.deletedCount,
        manual: acc.manual + (r.status === 'manual' ? 1 : 0)
      }), { totalEmails: emailIds.length, unsubscribed: 0, deleted: 0, manual: 0 });

      setStats(finalStats);
      addLog('Pulizia completata!', 'success');
    } catch (error) {
      addLog(`Errore durante la pulizia: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setCleaningProgress(100);
    }
  };

  const processNewsletterGroup = async (group) => {
    const result = {
      from: group.from,
      emailCount: group.emails.length,
      unsubscribeLink: null,
      status: 'pending',
      deletedCount: 0,
      error: null
    };

    // Extract unsubscribe link
    const unsubLink = extractUnsubscribeLink(group.listUnsubscribe);
    result.unsubscribeLink = unsubLink;

    if (!unsubLink) {
      result.status = 'no-link';
      addLog(`${group.from}: Nessun link di disiscrizione trovato`, 'warning');
    } else if (unsubLink.startsWith('mailto:')) {
      result.status = 'manual';
      result.error = 'Richiede disiscrizione manuale via email';
      addLog(`${group.from}: Richiede gestione manuale`, 'warning');
    } else if (unsubLink.startsWith('http')) {
      // Try to unsubscribe
      try {
        addLog(`${group.from}: Tentativo di disiscrizione...`, 'info');
        const response = await window.electronAPI.fetchUnsubscribe(unsubLink);
        
        if (response.success) {
          result.status = 'success';
          addLog(`${group.from}: Disiscrizione riuscita`, 'success');
        } else {
          result.status = 'failed';
          result.error = response.error || `HTTP ${response.status}`;
          addLog(`${group.from}: Disiscrizione fallita`, 'error');
        }
      } catch (error) {
        result.status = 'failed';
        result.error = error.message;
      }
    }

    // Delete emails if successful or no link
    if (result.status === 'success' || result.status === 'no-link') {
      try {
        await window.electronAPI.deleteMessages(group.emails);
        result.deletedCount = group.emails.length;
        addLog(`${group.from}: Eliminate ${result.deletedCount} email`, 'info');
      } catch (error) {
        addLog(`${group.from}: Errore eliminazione email`, 'error');
      }
    }

    return result;
  };

  const extractUnsubscribeLink = (listUnsubscribe) => {
    if (!listUnsubscribe) return null;
    
    const matches = listUnsubscribe.match(/<([^>]+)>/g);
    if (!matches) return listUnsubscribe.trim();
    
    for (const match of matches) {
      const link = match.slice(1, -1);
      if (link.startsWith('http') || link.startsWith('mailto:')) {
        return link;
      }
    }
    return null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'manual': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'no-link': return <Mail className="w-5 h-5 text-gray-400" />;
      default: return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'Disiscritto';
      case 'failed': return 'Fallito';
      case 'manual': return 'Manuale';
      case 'no-link': return 'No link';
      default: return 'In corso...';
    }
  };

  return (
    <div className="app">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-content">
          <div className="app-title">
            <GmailCleanerIcon size={20} />
            <span>Gmail Cleaner</span>
          </div>
          <div className="window-controls">
            <button onClick={() => window.electronAPI.minimizeWindow()}>
              <Minimize2 className="w-4 h-4" />
            </button>
            <button onClick={() => window.electronAPI.maximizeWindow()}>
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={() => window.electronAPI.closeWindow()} className="close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!isAuthenticated ? (
          <motion.div 
            className="auth-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="auth-card">
              <GmailCleanerIcon size={80} className="mb-6 mx-auto" />
              <h2>Connetti il tuo Gmail</h2>
              <p>Autorizza Gmail Cleaner Pro ad accedere alle tue email per iniziare la pulizia automatica delle newsletter.</p>
              <button 
                className="auth-button"
                onClick={handleAuthenticate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connessione...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Connetti Gmail
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="dashboard">
            {/* Stats */}
            <div className="stats-grid">
              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-8 h-8 text-blue-400" />
                <div className="stat-content">
                  <div className="stat-value">{stats.totalEmails}</div>
                  <div className="stat-label">Email totali</div>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div className="stat-content">
                  <div className="stat-value">{stats.unsubscribed}</div>
                  <div className="stat-label">Disiscritti</div>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-8 h-8 text-red-400" />
                <div className="stat-content">
                  <div className="stat-value">{stats.deleted}</div>
                  <div className="stat-label">Email eliminate</div>
                </div>
              </motion.div>

              <motion.div 
                className="stat-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <div className="stat-content">
                  <div className="stat-value">{stats.manual}</div>
                  <div className="stat-label">Azione manuale</div>
                </div>
              </motion.div>
            </div>

            {/* Action Button */}
            <div className="action-section">
              <button 
                className="start-button"
                onClick={startCleaning}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Pulizia in corso... {Math.round(cleaningProgress)}%
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Avvia pulizia newsletter
                  </>
                )}
              </button>

              {isLoading && (
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${cleaningProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Results */}
            <div className="results-section">
              <div className="results-header">
                <h3>Risultati pulizia</h3>
                {results.length > 0 && (
                  <span className="results-count">{results.length} mittenti processati</span>
                )}
              </div>

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div 
                    className="results-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {results.map((result, index) => (
                      <motion.div
                        key={index}
                        className="result-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedResult(result)}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="result-icon">
                          {getStatusIcon(result.status)}
                        </div>
                        <div className="result-content">
                          <div className="result-sender">{result.from}</div>
                          <div className="result-info">
                            <span className={`status status-${result.status}`}>
                              {getStatusText(result.status)}
                            </span>
                            <span className="email-count">{result.emailCount} email</span>
                            {result.deletedCount > 0 && (
                              <span className="deleted-count">
                                <Trash2 className="w-3 h-3" />
                                {result.deletedCount} eliminate
                              </span>
                            )}
                          </div>
                        </div>
                        {result.unsubscribeLink && result.status === 'manual' && (
                          <button
                            className="manual-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.electronAPI.openExternal(result.unsubscribeLink);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Logs */}
              <div className="logs-section">
                <h4>Log attività</h4>
                <div className="logs-container">
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <motion.div
                        key={index}
                        className={`log-item log-${log.type}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <span className="log-time">{log.timestamp}</span>
                        <span className="log-message">{log.message}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedResult(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Dettagli mittente</h3>
                <button onClick={() => setSelectedResult(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <span className="detail-label">Mittente:</span>
                  <span className="detail-value">{selectedResult.from}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Stato:</span>
                  <span className={`status status-${selectedResult.status}`}>
                    {getStatusIcon(selectedResult.status)}
                    {getStatusText(selectedResult.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email trovate:</span>
                  <span className="detail-value">{selectedResult.emailCount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email eliminate:</span>
                  <span className="detail-value">{selectedResult.deletedCount}</span>
                </div>
                {selectedResult.unsubscribeLink && (
                  <div className="detail-row">
                    <span className="detail-label">Link disiscrizione:</span>
                    <span className="detail-value link">
                      {selectedResult.unsubscribeLink}
                      <button
                        onClick={() => window.electronAPI.openExternal(selectedResult.unsubscribeLink)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </span>
                  </div>
                )}
                {selectedResult.error && (
                  <div className="detail-row error">
                    <span className="detail-label">Errore:</span>
                    <span className="detail-value">{selectedResult.error}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;