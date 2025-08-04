import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Trash2, CheckCircle2, AlertCircle, XCircle, 
  Loader2, ExternalLink, Minimize2, Maximize2, X,
  Shield, Zap, BarChart3, Archive, Tags, Settings,
  LogOut, Inbox, Paperclip, Filter, Clock, Sparkles,
  FolderOpen, Search, Download, AlertTriangle, User,
  RefreshCw
} from 'lucide-react';
import GmailCleanerIcon from './GmailCleanerIcon';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cleaningProgress, setCleaningProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [scanData, setScanData] = useState(null);
  const [stats, setStats] = useState({
    totalEmails: 0,
    unsubscribed: 0,
    deleted: 0,
    archived: 0,
    organized: 0,
    spaceFreed: 0
  });
  const [selectedResult, setSelectedResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
      loadLabels();
      performScan();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const authenticated = await window.electronAPI.checkAuth();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await window.electronAPI.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadLabels = async () => {
    try {
      const userLabels = await window.electronAPI.getLabels();
      setLabels(userLabels);
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const performScan = async () => {
    setIsScanning(true);
    addLog('Scansione casella email in corso...', 'info');
    
    try {
      const scanResult = await window.electronAPI.scanMailbox();
      setScanData(scanResult);
      
      setStats(prev => ({
        ...prev,
        totalEmails: scanResult.totalMessages
      }));
      
      addLog(`Scansione completata: ${scanResult.totalMessages} email totali`, 'success');
      addLog(`Newsletter: ${scanResult.categories.newsletters}`, 'info');
      addLog(`Spam/Promozioni: ${scanResult.categories.spam + scanResult.categories.promotions}`, 'info');
      addLog(`Email vecchie: ${scanResult.categories.old}`, 'info');
      addLog(`Con allegati: ${scanResult.categories.withAttachments}`, 'info');
    } catch (error) {
      addLog(`Errore durante la scansione: ${error.message}`, 'error');
    } finally {
      setIsScanning(false);
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

  const handleLogout = async () => {
    try {
      await window.electronAPI.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
      setScanData(null);
      setActiveSection('dashboard');
      addLog('Disconnessione effettuata', 'info');
    } catch (error) {
      addLog('Errore durante la disconnessione', 'error');
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  // Cleaning functions
  const cleanSpamAndPromotions = async () => {
    if (!scanData) {
      addLog('Esegui prima una scansione della casella', 'warning');
      await performScan();
      return;
    }

    setIsLoading(true);
    setCleaningProgress(0);
    addLog('Ricerca spam e promozioni...', 'info');

    try {
      const emails = await window.electronAPI.getSpamPromotions();
      addLog(`Trovate ${emails.length} email da pulire`, 'info');

      if (emails.length > 0) {
        setCleaningProgress(50);
        const emailIds = emails.map(e => e.id);
        await window.electronAPI.deleteMessages(emailIds);
        
        setStats(prev => ({
          ...prev,
          deleted: prev.deleted + emails.length
        }));
        
        addLog(`Eliminate ${emails.length} email spam/promozioni`, 'success');
      }
      
      setCleaningProgress(100);
      await performScan(); // Rescan after cleaning
    } catch (error) {
      addLog(`Errore durante la pulizia: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeNewsletters = async () => {
    if (!scanData) {
      addLog('Esegui prima una scansione della casella', 'warning');
      await performScan();
      return;
    }

    setIsLoading(true);
    setResults([]);
    setCleaningProgress(0);
    addLog('Avvio disiscrizione newsletter...', 'info');

    try {
      const newsletters = await window.electronAPI.getNewsletters();
      addLog(`Trovate ${newsletters.length} newsletter`, 'info');

      const grouped = {};

      for (const email of newsletters) {
        const key = `${email.from}|||${email['list-unsubscribe'] || ''}`;
        
        if (!grouped[key]) {
          grouped[key] = {
            from: email.from,
            listUnsubscribe: email['list-unsubscribe'],
            emails: []
          };
        }
        grouped[key].emails.push(email.id);
      }

      const groupKeys = Object.keys(grouped);
      let groupIndex = 0;

      for (const key of groupKeys) {
        const group = grouped[key];
        const result = await processNewsletterGroup(group);
        
        setResults(prev => [...prev, result]);
        groupIndex++;
        setCleaningProgress((groupIndex / groupKeys.length) * 100);
      }

      addLog('Disiscrizione completata!', 'success');
      await performScan(); // Rescan after unsubscribing
    } catch (error) {
      addLog(`Errore durante la disiscrizione: ${error.message}`, 'error');
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

    const unsubLink = extractUnsubscribeLink(group.listUnsubscribe);
    result.unsubscribeLink = unsubLink;

    if (!unsubLink) {
      result.status = 'no-link';
    } else if (unsubLink.startsWith('mailto:')) {
      result.status = 'manual';
      result.error = 'Richiede disiscrizione manuale via email';
    } else if (unsubLink.startsWith('http')) {
      try {
        const response = await window.electronAPI.fetchUnsubscribe(unsubLink);
        result.status = response.success ? 'success' : 'failed';
        if (!response.success) {
          result.error = response.error || `HTTP ${response.status}`;
        }
      } catch (error) {
        result.status = 'failed';
        result.error = error.message;
      }
    }

    if (result.status === 'success' || result.status === 'no-link') {
      try {
        await window.electronAPI.deleteMessages(group.emails);
        result.deletedCount = group.emails.length;
        setStats(prev => ({
          ...prev,
          deleted: prev.deleted + result.deletedCount,
          unsubscribed: prev.unsubscribed + (result.status === 'success' ? 1 : 0)
        }));
      } catch (error) {
        console.error('Error deleting emails:', error);
      }
    }

    return result;
  };

  const archiveOldEmails = async () => {
    if (!scanData) {
      addLog('Esegui prima una scansione della casella', 'warning');
      await performScan();
      return;
    }

    setIsLoading(true);
    setCleaningProgress(0);
    addLog('Archiviazione email vecchie...', 'info');

    try {
      const emails = await window.electronAPI.getOldEmails(90);
      addLog(`Trovate ${emails.length} email da archiviare`, 'info');

      if (emails.length > 0) {
        setCleaningProgress(50);
        const emailIds = emails.map(e => e.id);
        const result = await window.electronAPI.archiveMessages(emailIds);
        
        setStats(prev => ({
          ...prev,
          archived: prev.archived + result.count
        }));
        
        addLog(`Archiviate ${result.count} email`, 'success');
      }
      
      setCleaningProgress(100);
      await performScan(); // Rescan after archiving
    } catch (error) {
      addLog(`Errore durante l'archiviazione: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const organizeWithLabels = async () => {
    setIsLoading(true);
    addLog('Organizzazione automatica con etichette...', 'info');

    try {
      const labelNames = ['Lavoro', 'Personale', 'Finanze', 'Shopping', 'Social'];
      const colors = [
        { backgroundColor: '#4285f4', textColor: '#ffffff' },
        { backgroundColor: '#0f9d58', textColor: '#ffffff' },
        { backgroundColor: '#f4b400', textColor: '#000000' },
        { backgroundColor: '#db4437', textColor: '#ffffff' },
        { backgroundColor: '#673ab7', textColor: '#ffffff' }
      ];

      for (let i = 0; i < labelNames.length; i++) {
        const existingLabel = labels.find(l => l.name === labelNames[i]);
        if (!existingLabel) {
          try {
            await window.electronAPI.createLabel(labelNames[i], colors[i]);
            addLog(`Creata etichetta: ${labelNames[i]}`, 'success');
          } catch (error) {
            if (!error.message.includes('already exists')) {
              addLog(`Errore creazione etichetta ${labelNames[i]}: ${error.message}`, 'error');
            }
          }
        }
      }

      await loadLabels();
      addLog('Organizzazione completata!', 'success');
    } catch (error) {
      addLog(`Errore durante l'organizzazione: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const manageAttachments = async () => {
    if (!scanData) {
      addLog('Esegui prima una scansione della casella', 'warning');
      await performScan();
      return;
    }

    setIsLoading(true);
    addLog('Ricerca email con allegati pesanti...', 'info');

    try {
      const emails = await window.electronAPI.getEmailsWithAttachments(5);
      const totalSize = emails.reduce((sum, email) => sum + (email.totalSize || 0), 0);
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      addLog(`Trovate ${emails.length} email con allegati pesanti (${totalSizeMB} MB totali)`, 'info');
      
      setStats(prev => ({
        ...prev,
        spaceFreed: prev.spaceFreed + parseFloat(totalSizeMB)
      }));
    } catch (error) {
      addLog(`Errore durante la gestione allegati: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeAll = async () => {
    addLog('Avvio ottimizzazione completa...', 'info');
    
    if (!scanData) {
      await performScan();
    }
    
    await cleanSpamAndPromotions();
    await unsubscribeNewsletters();
    await archiveOldEmails();
    await organizeWithLabels();
    await manageAttachments();
    
    addLog('Ottimizzazione completa terminata!', 'success');
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

  const sections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 'clean',
      title: 'Pulizia e Sfoltimento',
      icon: <Trash2 className="w-6 h-6" />,
      color: 'red'
    },
    {
      id: 'unsubscribe',
      title: 'Disiscrizione',
      icon: <XCircle className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      id: 'organize',
      title: 'Organizzazione',
      icon: <FolderOpen className="w-6 h-6" />,
      color: 'green'
    },
    {
      id: 'advanced',
      title: 'Gestione Avanzata',
      icon: <Settings className="w-6 h-6" />,
      color: 'purple'
    },
    {
      id: 'optimize',
      title: 'Ottimizza Tutto',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'pink'
    }
  ];

  return (
    <div className="app">
      {/* Title Bar */}
      <div className="title-bar">
        <div className="title-bar-content">
          <div className="app-title">
            <GmailCleanerIcon size={20} />
            <span>Gmail Cleaner Pro</span>
          </div>
          {isAuthenticated && userProfile && (
            <div className="user-info">
              <User className="w-4 h-4" />
              <span>{userProfile.emailAddress}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
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
              <p>Autorizza Gmail Cleaner Pro ad accedere alle tue email per iniziare la pulizia e l'organizzazione automatica.</p>
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
          <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </motion.button>
              ))}
            </div>

            {/* Content Area */}
            <div className="content-area">
              <AnimatePresence mode="wait">
                {activeSection === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <div className="dashboard-header">
                      <h2>Dashboard</h2>
                      <button 
                        className="scan-button"
                        onClick={performScan}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Scansione...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5" />
                            Scansiona
                          </>
                        )}
                      </button>
                    </div>

                    {scanData && (
                      <div className="scan-info">
                        <p>Ultima scansione: {new Date(scanData.scannedAt).toLocaleString()}</p>
                      </div>
                    )}

                    <div className="stats-grid">
                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <Mail className="w-8 h-8 text-blue-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.totalEmails}</div>
                          <div className="stat-label">Email totali</div>
                        </div>
                      </motion.div>

                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.unsubscribed}</div>
                          <div className="stat-label">Disiscritti</div>
                        </div>
                      </motion.div>

                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <Trash2 className="w-8 h-8 text-red-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.deleted}</div>
                          <div className="stat-label">Email eliminate</div>
                        </div>
                      </motion.div>

                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <Archive className="w-8 h-8 text-purple-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.archived}</div>
                          <div className="stat-label">Email archiviate</div>
                        </div>
                      </motion.div>

                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <Tags className="w-8 h-8 text-yellow-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.organized}</div>
                          <div className="stat-label">Email organizzate</div>
                        </div>
                      </motion.div>

                      <motion.div className="stat-card" whileHover={{ scale: 1.02 }}>
                        <Download className="w-8 h-8 text-indigo-400" />
                        <div className="stat-content">
                          <div className="stat-value">{stats.spaceFreed} MB</div>
                          <div className="stat-label">Spazio liberato</div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Activity logs */}
                    <div className="logs-section">
                      <h4>Attività recenti</h4>
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
                  </motion.div>
                )}

                {activeSection === 'clean' && (
                  <motion.div
                    key="clean"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <h2>Pulizia e Sfoltimento Casella</h2>
                    <div className="feature-grid">
                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon red">
                          <Trash2 className="w-8 h-8" />
                        </div>
                        <h3>Cancella Spam e Promozioni</h3>
                        <p>Elimina automaticamente email spam, promozioni e notifiche inutili.</p>
                        {scanData && (
                          <p className="feature-count">
                            {scanData.categories.spam + scanData.categories.promotions} email trovate
                          </p>
                        )}
                        <button 
                          className="feature-button red"
                          onClick={cleanSpamAndPromotions}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pulisci Ora'}
                        </button>
                      </motion.div>

                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon blue">
                          <Clock className="w-8 h-8" />
                        </div>
                        <h3>Elimina Email Vecchie</h3>
                        <p>Rimuovi automaticamente messaggi più vecchi di 6 mesi.</p>
                        {scanData && (
                          <p className="feature-count">
                            {scanData.categories.old} email vecchie trovate
                          </p>
                        )}
                        <button 
                          className="feature-button blue" 
                          onClick={async () => {
                            if (!scanData) {
                              await performScan();
                              return;
                            }
                            setIsLoading(true);
                            addLog('Eliminazione email vecchie...', 'info');
                            try {
                              const emails = await window.electronAPI.getOldEmails(180);
                              if (emails.length > 0) {
                                const emailIds = emails.map(e => e.id);
                                await window.electronAPI.deleteMessages(emailIds);
                                setStats(prev => ({
                                  ...prev,
                                  deleted: prev.deleted + emails.length
                                }));
                                addLog(`Eliminate ${emails.length} email vecchie`, 'success');
                                await performScan();
                              }
                            } catch (error) {
                              addLog(`Errore: ${error.message}`, 'error');
                            }
                            setIsLoading(false);
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Elimina Vecchie'}
                        </button>
                      </motion.div>
                    </div>

                    {isLoading && (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${cleaningProgress}%` }}
                          />
                        </div>
                        <p>Pulizia in corso... {Math.round(cleaningProgress)}%</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'unsubscribe' && (
                  <motion.div
                    key="unsubscribe"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <h2>Disiscrizione da Newsletter</h2>
                    <div className="feature-card">
                      <div className="feature-icon yellow">
                        <XCircle className="w-8 h-8" />
                      </div>
                      <h3>Disiscrizione Automatica</h3>
                      <p>Trova e annulla l'iscrizione da tutte le newsletter indesiderate.</p>
                      {scanData && (
                        <p className="feature-count">
                          {scanData.categories.newsletters} newsletter trovate
                        </p>
                      )}
                      <button 
                        className="feature-button yellow"
                        onClick={unsubscribeNewsletters}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Avvia Disiscrizione'}
                      </button>
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                      <div className="results-section">
                        <h3>Risultati disiscrizione</h3>
                        <div className="results-list">
                          {results.map((result, index) => (
                            <motion.div
                              key={index}
                              className="result-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="result-icon">
                                {getStatusIcon(result.status)}
                              </div>
                              <div className="result-content">
                                <div className="result-sender">{result.from}</div>
                                <div className="result-info">
                                  <span className={`status status-${result.status}`}>
                                    {result.status === 'success' ? 'Disiscritto' :
                                     result.status === 'manual' ? 'Manuale' :
                                     result.status === 'failed' ? 'Fallito' : 'No link'}
                                  </span>
                                  <span className="email-count">{result.emailCount} email</span>
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
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'organize' && (
                  <motion.div
                    key="organize"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <h2>Organizzazione e Archiviazione</h2>
                    <div className="feature-grid">
                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon green">
                          <Archive className="w-8 h-8" />
                        </div>
                        <h3>Archiviazione Intelligente</h3>
                        <p>Archivia automaticamente email vecchie ma importanti.</p>
                        {scanData && (
                          <p className="feature-count">
                            {scanData.categories.old} email da archiviare
                          </p>
                        )}
                        <button 
                          className="feature-button green"
                          onClick={archiveOldEmails}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Archivia'}
                        </button>
                      </motion.div>

                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon purple">
                          <Tags className="w-8 h-8" />
                        </div>
                        <h3>Etichette Automatiche</h3>
                        <p>Organizza le email con etichette intelligenti.</p>
                        <button 
                          className="feature-button purple"
                          onClick={organizeWithLabels}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Organizza'}
                        </button>
                      </motion.div>
                    </div>

                    {labels.length > 0 && (
                      <div className="labels-section">
                        <h3>Etichette disponibili</h3>
                        <div className="labels-grid">
                          {labels.filter(l => l.type === 'user').map((label) => (
                            <div key={label.id} className="label-chip">
                              <Tags className="w-4 h-4" />
                              <span>{label.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'advanced' && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <h2>Gestione Avanzata</h2>
                    <div className="feature-grid">
                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon indigo">
                          <Paperclip className="w-8 h-8" />
                        </div>
                        <h3>Gestione Allegati</h3>
                        <p>Trova e gestisci email con allegati pesanti.</p>
                        {scanData && (
                          <p className="feature-count">
                            {scanData.categories.withAttachments} email con allegati
                          </p>
                        )}
                        <button 
                          className="feature-button indigo"
                          onClick={manageAttachments}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gestisci'}
                        </button>
                      </motion.div>

                      <motion.div className="feature-card" whileHover={{ scale: 1.02 }}>
                        <div className="feature-icon orange">
                          <Filter className="w-8 h-8" />
                        </div>
                        <h3>Regole Personalizzate</h3>
                        <p>Crea filtri e regole automatiche personalizzate.</p>
                        <button 
                          className="feature-button orange" 
                          onClick={() => {
                            addLog('Funzionalità in arrivo nella prossima versione', 'info');
                          }}
                          disabled={isLoading}
                        >
                          Configura
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'optimize' && (
                  <motion.div
                    key="optimize"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="section-content"
                  >
                    <h2>Ottimizzazione Completa</h2>
                    <div className="optimize-card">
                      <Sparkles className="w-16 h-16 text-pink-400 mb-4" />
                      <h3>Ottimizza Tutto Automaticamente</h3>
                      <p>Esegui tutte le operazioni di pulizia e organizzazione in un solo click.</p>
                      <ul className="optimize-list">
                        <li><CheckCircle2 className="w-5 h-5" /> Elimina spam e promozioni</li>
                        <li><CheckCircle2 className="w-5 h-5" /> Disiscrivi da newsletter</li>
                        <li><CheckCircle2 className="w-5 h-5" /> Archivia email vecchie</li>
                        <li><CheckCircle2 className="w-5 h-5" /> Organizza con etichette</li>
                        <li><CheckCircle2 className="w-5 h-5" /> Gestisci allegati pesanti</li>
                      </ul>
                      <button 
                        className="optimize-button"
                        onClick={optimizeAll}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Ottimizzazione in corso...
                          </>
                        ) : (
                          <>
                            <Zap className="w-6 h-6" />
                            Ottimizza Ora
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;