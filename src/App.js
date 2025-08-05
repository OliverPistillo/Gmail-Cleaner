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

// Gmail Cleaner Icon Component
const GmailCleanerIcon = ({ size = 48, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 256 256" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="128" cy="128" r="120" fill="#f5f5f5" fillOpacity="0.1"/>
    <g transform="translate(40, 60)">
      <rect x="0" y="20" width="120" height="80" rx="8" fill="#EA4335" />
      <path d="M0 28 L60 60 L120 28 L120 20 L0 20 Z" fill="#EA4335" />
      <path d="M0 28 L60 60 L120 28" stroke="#C5221F" strokeWidth="2" />
      <circle cx="30" cy="30" r="24" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="30" cy="30" r="22" fill="none" stroke="#EA4335" strokeWidth="3" />
      <path d="M18 25 L24 35 L30 28 L36 35 L42 25" 
            stroke="#EA4335" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" />
      <path d="M12 12 L48 48" stroke="#EA4335" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g transform="translate(100, 80) rotate(-30 40 40)">
      <rect x="35" y="0" width="10" height="60" rx="5" fill="#37474F" />
      <path d="M20 60 L60 60 L65 85 L55 90 L45 88 L35 90 L25 88 L15 85 Z" 
            fill="#EA4335" 
            stroke="#37474F" 
            strokeWidth="2" />
      <path d="M25 60 L22 85 M35 60 L35 88 M45 60 L48 85 M55 60 L58 85" 
            stroke="#C5221F" 
            strokeWidth="1.5" 
            strokeLinecap="round" />
    </g>
    <g transform="translate(140, 120)">
      <rect x="0" y="0" width="6" height="6" fill="#EA4335" opacity="0.8" transform="rotate(45 3 3)" />
      <rect x="15" y="5" width="5" height="5" fill="#EA4335" opacity="0.6" transform="rotate(30 17.5 7.5)" />
      <rect x="25" y="0" width="4" height="4" fill="#EA4335" opacity="0.4" transform="rotate(60 27 2)" />
    </g>
  </svg>
);

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

  // Gmail valid label colors
  const GMAIL_LABEL_COLORS = [
    { backgroundColor: '#434343', textColor: '#ffffff' },
    { backgroundColor: '#666666', textColor: '#ffffff' },
    { backgroundColor: '#999999', textColor: '#ffffff' },
    { backgroundColor: '#cccccc', textColor: '#000000' },
    { backgroundColor: '#efa093', textColor: '#000000' },
    { backgroundColor: '#f691b3', textColor: '#000000' },
    { backgroundColor: '#facad8', textColor: '#000000' },
    { backgroundColor: '#ffd6a2', textColor: '#000000' },
    { backgroundColor: '#fbe983', textColor: '#000000' },
    { backgroundColor: '#fdedc1', textColor: '#000000' },
    { backgroundColor: '#b3efd3', textColor: '#000000' },
    { backgroundColor: '#a2dcc1', textColor: '#000000' },
    { backgroundColor: '#89d3b2', textColor: '#000000' },
    { backgroundColor: '#68dfa9', textColor: '#000000' },
    { backgroundColor: '#44b984', textColor: '#ffffff' },
    { backgroundColor: '#16a766', textColor: '#ffffff' },
    { backgroundColor: '#43d692', textColor: '#000000' },
    { backgroundColor: '#a2c2e0', textColor: '#000000' },
    { backgroundColor: '#85bafc', textColor: '#000000' },
    { backgroundColor: '#7baaf7', textColor: '#000000' },
    { backgroundColor: '#4a90e2', textColor: '#ffffff' },
    { backgroundColor: '#2b7de9', textColor: '#ffffff' },
  ];

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

  const extractDomain = (email) => {
    const match = email.match(/@([^>]+)>/);
    if (match) {
      return match[1].split('.')[0];
    }
    const simpleMatch = email.match(/@(.+)$/);
    if (simpleMatch) {
      return simpleMatch[1].split('.')[0];
    }
    return null;
  };

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
      await performScan();
    } catch (error) {
      addLog(`Errore durante la pulizia: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOldEmails = async () => {
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
      } else {
        addLog('Nessuna email vecchia da eliminare', 'info');
      }
    } catch (error) {
      addLog(`Errore: ${error.message}`, 'error');
    }
    setIsLoading(false);
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
      const processedSenders = new Set();

      for (const email of newsletters) {
        if (!email.from) continue;
        
        const senderDomain = email.from.toLowerCase().replace(/.*</, '').replace(/>.*/, '');
        
        if (processedSenders.has(senderDomain)) {
          continue;
        }
        
        const key = senderDomain;
        processedSenders.add(senderDomain);
        
        if (!grouped[key]) {
          grouped[key] = {
            from: email.from,
            listUnsubscribe: email['list-unsubscribe'] || '',
            emails: []
          };
        }
        
        const senderEmails = newsletters.filter(n => 
          n.from && n.from.toLowerCase().includes(senderDomain)
        );
        
        grouped[key].emails = senderEmails.map(e => e.id);
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
      await performScan();
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
      addLog(`${group.from}: Nessun link di disiscrizione`, 'warning');
    } else if (unsubLink.startsWith('mailto:')) {
      result.status = 'manual';
      result.error = 'Richiede disiscrizione manuale via email';
      addLog(`${group.from}: Richiede azione manuale`, 'warning');
    } else if (unsubLink.startsWith('http')) {
      try {
        const response = await window.electronAPI.fetchUnsubscribe(unsubLink);
        result.status = response.success ? 'success' : 'failed';
        if (!response.success) {
          result.error = response.error || `HTTP ${response.status}`;
        }
        if (result.status === 'success') {
          addLog(`${group.from}: Disiscrizione automatica riuscita`, 'success');
        } else {
          addLog(`${group.from}: Disiscrizione automatica fallita`, 'error');
        }
      } catch (error) {
        result.status = 'failed';
        result.error = error.message;
      }
    }

    if (result.status === 'success') {
      try {
        await window.electronAPI.deleteMessages(group.emails);
        result.deletedCount = group.emails.length;
        setStats(prev => ({
          ...prev,
          deleted: prev.deleted + result.deletedCount,
          unsubscribed: prev.unsubscribed + 1
        }));
        addLog(`${group.from}: Eliminate ${result.deletedCount} email`, 'info');
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
      await performScan();
    } catch (error) {
      addLog(`Errore durante l'archiviazione: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const organizeWithLabels = async () => {
    setIsLoading(true);
    addLog('Creazione etichette intelligenti basate sui domini...', 'info');

    try {
      const recentEmails = await window.electronAPI.getNewsletters(100);
      const domains = new Map();
      
      for (const email of recentEmails) {
        if (email.from) {
          const domain = extractDomain(email.from);
          if (domain) {
            domains.set(domain, (domains.get(domain) || 0) + 1);
          }
        }
      }
      
      const topDomains = Array.from(domains.entries())
        .filter(([domain, count]) => count > 5)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      let labelIndex = 0;
      for (const [domain, count] of topDomains) {
        const labelName = domain.charAt(0).toUpperCase() + domain.slice(1);
        const existingLabel = labels.find(l => l.name === labelName);
        
        if (!existingLabel) {
          try {
            const color = GMAIL_LABEL_COLORS[labelIndex % GMAIL_LABEL_COLORS.length];
            await window.electronAPI.createLabel(labelName, color);
            addLog(`Creata etichetta: ${labelName} (${count} email)`, 'success');
            labelIndex++;
          } catch (error) {
            if (!error.message.includes('already exists')) {
              addLog(`Errore creazione etichetta ${labelName}: ${error.message}`, 'error');
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
      
      for (const email of emails.slice(0, 10)) {
        const headers = email.headers || [];
        const fromHeader = headers.find(h => h.name === 'From');
        const subjectHeader = headers.find(h => h.name === 'Subject');
        
        if (fromHeader && subjectHeader) {
          const sizeMB = (email.totalSize / (1024 * 1024)).toFixed(2);
          addLog(`📎 ${fromHeader.value} - "${subjectHeader.value}" (${sizeMB} MB)`, 'info');
        }
      }
      
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
    
    try {
      const result = await window.electronAPI.cleanAutomatedEmails();
      if (result.deleted > 0) {
        setStats(prev => ({
          ...prev,
          deleted: prev.deleted + result.deleted
        }));
        addLog(`Eliminate ${result.deleted} email automatiche duplicate`, 'success');
      }
    } catch (error) {
      console.error('Error cleaning automated emails:', error);
    }
    
    addLog('Ottimizzazione completa terminata!', 'success');
  };

  const extractUnsubscribeLink = (listUnsubscribe) => {
    if (!listUnsubscribe) return null;
    
    const urlMatch = listUnsubscribe.match(/<(https?:\/\/[^>]+)>/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    const mailtoMatch = listUnsubscribe.match(/<(mailto:[^>]+)>/);
    if (mailtoMatch) {
      return mailtoMatch[1];
    }
    
    if (listUnsubscribe.startsWith('http')) {
      return listUnsubscribe.trim();
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

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#a0a0a0';
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
    <div className="bg-gray-900 h-screen flex flex-col text-white font-sans overflow-hidden">
      {/* Title Bar */}
      <div className="h-10 bg-black/30 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 relative z-50">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <GmailCleanerIcon size={20} />
          <span>Gmail Cleaner Pro</span>
        </div>
        
        {isAuthenticated && userProfile && (
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3 text-sm text-gray-400">
            <User className="w-4 h-4" />
            <span>{userProfile.emailAddress}</span>
            <button 
              onClick={handleLogout} 
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.electronAPI.minimizeWindow()}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => window.electronAPI.maximizeWindow()}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => window.electronAPI.closeWindow()}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {!isAuthenticated ? (
          <motion.div 
            className="flex items-center justify-center min-h-full p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center max-w-lg shadow-2xl">
              <GmailCleanerIcon size={80} className="mb-6 mx-auto" />
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Connetti il tuo Gmail
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Autorizza Gmail Cleaner Pro ad accedere alle tue email per iniziare la pulizia e l'organizzazione automatica.
              </p>
              <button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-3 hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 overflow-y-auto">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  className={`w-full px-5 py-4 rounded-xl font-medium text-left flex items-center gap-3 transition-all mb-2 ${
                    activeSection === section.id 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
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
            <div className="flex-1 overflow-y-auto p-10">
              <AnimatePresence mode="wait">
                {activeSection === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Dashboard
                      </h2>
                      <button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70"
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
                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 mb-6 text-sm text-gray-400">
                        Ultima scansione: {new Date(scanData.scannedAt).toLocaleString()}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">
                      {[
                        { icon: Mail, label: 'Email totali', value: stats.totalEmails, color: 'blue' },
                        { icon: CheckCircle2, label: 'Disiscritti', value: stats.unsubscribed, color: 'green' },
                        { icon: Trash2, label: 'Email eliminate', value: stats.deleted, color: 'red' },
                        { icon: Archive, label: 'Email archiviate', value: stats.archived, color: 'purple' },
                        { icon: Tags, label: 'Email organizzate', value: stats.organized, color: 'yellow' },
                        { icon: Download, label: 'Spazio liberato', value: `${stats.spaceFreed} MB`, color: 'indigo' }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex items-center gap-5 cursor-pointer hover:bg-white/10 transition-all"
                          whileHover={{ scale: 1.02 }}
                        >
                          <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                          <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Logs */}
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-300">Attività recenti</h4>
                      <div className="bg-gray-900/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                        <AnimatePresence>
                          {logs.map((log, index) => (
                            <motion.div
                              key={index}
                              className="flex gap-3 py-2 text-sm border-b border-white/5 last:border-0"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                            >
                              <span className="text-gray-500 font-mono text-xs">{log.timestamp}</span>
                              <span style={{ color: getLogColor(log.type) }}>{log.message}</span>
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
                  >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Pulizia e Sfoltimento Casella
                    </h2>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Clean Spam */}
                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <Trash2 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Cancella Spam e Promozioni</h3>
                        <p className="text-gray-400 mb-6">Elimina automaticamente email spam, promozioni e notifiche inutili.</p>
                        {scanData && (
                          <p className="text-blue-400 font-semibold text-sm mb-6">
                            {scanData.categories.spam + scanData.categories.promotions} email trovate
                          </p>
                        )}
                        <button 
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-70"
                          onClick={cleanSpamAndPromotions}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pulisci Ora'}
                        </button>
                      </motion.div>

                      {/* Delete Old */}
                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Clock className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Elimina Email Vecchie</h3>
                        <p className="text-gray-400 mb-6">Rimuovi automaticamente messaggi più vecchi di 6 mesi.</p>
                        {scanData && (
                          <p className="text-blue-400 font-semibold text-sm mb-6">
                            {scanData.categories.old} email vecchie trovate
                          </p>
                        )}
                        <button 
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70"
                          onClick={deleteOldEmails}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Elimina Vecchie'}
                        </button>
                      </motion.div>

                      {/* Clean Automated */}
                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Pulizia Email Automatiche</h3>
                        <p className="text-gray-400 mb-6">Mantieni solo l'ultima email di accessi, conferme ordini, notifiche di sicurezza.</p>
                        <button 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-70"
                          onClick={async () => {
                            if (!scanData) {
                              await performScan();
                              return;
                            }
                            setIsLoading(true);
                            addLog('Pulizia email automatiche...', 'info');
                            try {
                              const result = await window.electronAPI.cleanAutomatedEmails();
                              if (result.deleted > 0) {
                                setStats(prev => ({
                                  ...prev,
                                  deleted: prev.deleted + result.deleted
                                }));
                                addLog(`Eliminate ${result.deleted} email automatiche duplicate da ${result.groups} gruppi`, 'success');
                              } else {
                                addLog('Nessuna email automatica duplicata trovata', 'info');
                              }
                              await performScan();
                            } catch (error) {
                              addLog(`Errore: ${error.message}`, 'error');
                            }
                            setIsLoading(false);
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pulisci Automatiche'}
                        </button>
                      </motion.div>
                    </div>

                    {isLoading && (
                      <div className="mt-8 text-center">
                        <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${cleaningProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="text-gray-400">Pulizia in corso... {Math.round(cleaningProgress)}%</p>
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
                  >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Disiscrizione da Newsletter
                    </h2>
                    
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">Disiscrizione Automatica</h3>
                      <p className="text-gray-400 mb-6">Trova e annulla l'iscrizione da tutte le newsletter indesiderate.</p>
                      {scanData && (
                        <p className="text-blue-400 font-semibold text-sm mb-6">
                          {scanData.categories.newsletters} newsletter trovate
                        </p>
                      )}
                      <button 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-yellow-500/25 transition-all disabled:opacity-70"
                        onClick={unsubscribeNewsletters}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Avvia Disiscrizione'}
                      </button>
                    </div>

                    {results.length > 0 && (
                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-6">Risultati disiscrizione</h3>
                        <div className="space-y-3">
                          {results.map((result, index) => (
                            <motion.div
                              key={index}
                              className="bg-gray-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-gray-900/70 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="flex-shrink-0">
                                {getStatusIcon(result.status)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{result.from}</div>
                                <div className="text-sm text-gray-400 flex items-center gap-4">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                    result.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                    result.status === 'manual' ? 'bg-yellow-500/20 text-yellow-400' :
                                    result.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {result.status === 'success' ? 'Disiscritto' :
                                     result.status === 'manual' ? 'Manuale' :
                                     result.status === 'failed' ? 'Fallito' : 'No link'}
                                  </span>
                                  <span>{result.emailCount} email</span>
                                  {result.deletedCount > 0 && (
                                    <span>({result.deletedCount} eliminate)</span>
                                  )}
                                </div>
                              </div>
                              {result.unsubscribeLink && result.status === 'manual' && (
                                <button
                                  className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg hover:bg-yellow-500/30 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (result.unsubscribeLink) {
                                      window.electronAPI.openExternal(result.unsubscribeLink);
                                    }
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
                  >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Organizzazione e Archiviazione
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                          <Archive className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Archiviazione Intelligente</h3>
                        <p className="text-gray-400 mb-6">Archivia automaticamente email vecchie ma importanti.</p>
                        {scanData && (
                          <p className="text-blue-400 font-semibold text-sm mb-6">
                            {scanData.categories.old} email da archiviare
                          </p>
                        )}
                        <button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-70"
                          onClick={archiveOldEmails}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Archivia'}
                        </button>
                      </motion.div>

                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Tags className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Etichette Intelligenti</h3>
                        <p className="text-gray-400 mb-6">Crea etichette basate sui domini più frequenti.</p>
                        <button 
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-70"
                          onClick={organizeWithLabels}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Organizza'}
                        </button>
                      </motion.div>
                    </div>

                    {labels.length > 0 && (
                      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4">Etichette disponibili</h3>
                        <div className="flex flex-wrap gap-3">
                          {labels.filter(l => l.type === 'user').map((label) => (
                            <div key={label.id} className="bg-gray-800/50 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-sm">
                              <Tags className="w-4 h-4 text-gray-400" />
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
                  >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Gestione Avanzata
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                          <Paperclip className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Gestione Allegati</h3>
                        <p className="text-gray-400 mb-6">Trova e gestisci email con allegati pesanti.</p>
                        {scanData && (
                          <p className="text-blue-400 font-semibold text-sm mb-6">
                            {scanData.categories.withAttachments} email con allegati
                          </p>
                        )}
                        <button 
                          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-70"
                          onClick={manageAttachments}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analizza'}
                        </button>
                      </motion.div>

                      <motion.div 
                        className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                          <Filter className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Regole Personalizzate</h3>
                        <p className="text-gray-400 mb-6">Crea filtri e regole automatiche personalizzate.</p>
                        <button 
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-70"
                          onClick={() => {
                            addLog('Funzionalità in arrivo nella prossima versione', 'info');
                          }}
                          disabled={isLoading}
                        >
                          Prossimamente
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
                  >
                    <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Ottimizzazione Completa
                    </h2>
                    
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-12 text-center max-w-2xl mx-auto">
                      <Sparkles className="w-16 h-16 text-pink-400 mb-4 mx-auto" />
                      <h3 className="text-2xl font-bold mb-4">Ottimizza Tutto Automaticamente</h3>
                      <p className="text-gray-400 mb-8">Esegui tutte le operazioni di pulizia e organizzazione in un solo click.</p>
                      
                      <ul className="text-left mb-8 space-y-3">
                        {[
                          'Elimina spam e promozioni',
                          'Disiscrivi da newsletter',
                          'Archivia email vecchie',
                          'Organizza con etichette',
                          'Gestisci allegati pesanti',
                          'Pulisci email automatiche duplicate'
                        ].map((item, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button 
                        className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-12 py-5 rounded-2xl text-lg font-semibold inline-flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-pink-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70"
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