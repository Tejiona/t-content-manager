export type Lang = 'fr' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // ─── Navigation ───
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'nav.create': { fr: 'Créer', en: 'Create' },
  'nav.calendar': { fr: 'Calendrier', en: 'Calendar' },
  'nav.library': { fr: 'Bibliothèque', en: 'Library' },
  'nav.clients': { fr: 'Clients', en: 'Clients' },
  'nav.reports': { fr: 'Rapports', en: 'Reports' },
  'nav.settings': { fr: 'Paramètres', en: 'Settings' },
  'nav.main': { fr: 'Principal', en: 'Main' },
  'nav.management': { fr: 'Gestion', en: 'Management' },

  // ─── Dashboard ───
  'dash.postsCreated': { fr: 'Posts créés', en: 'Posts created' },
  'dash.published': { fr: 'Publiés', en: 'Published' },
  'dash.scheduled': { fr: 'Programmés', en: 'Scheduled' },
  'dash.activeClients': { fr: 'Clients actifs', en: 'Active clients' },
  'dash.upcoming': { fr: 'Posts à venir', en: 'Upcoming posts' },
  'dash.recentActivity': { fr: 'Activité récente', en: 'Recent activity' },
  'dash.noScheduled': { fr: 'Aucun post programmé', en: 'No scheduled posts' },
  'dash.noActivity': { fr: 'Aucune activité', en: 'No activity' },

  // ─── Create ───
  'create.title': { fr: 'Générateur IA', en: 'AI Generator' },
  'create.client': { fr: 'Client', en: 'Client' },
  'create.selectClient': { fr: '— Sélectionner un client —', en: '— Select a client —' },
  'create.platforms': { fr: 'Plateformes cibles', en: 'Target platforms' },
  'create.topic': { fr: 'Sujet / Thème du post', en: 'Post topic / theme' },
  'create.topicPlaceholder': { fr: 'Ex: Lancement de notre nouveau produit bio...', en: 'e.g.: Launch of our new organic product...' },
  'create.tone': { fr: 'Ton', en: 'Tone' },
  'create.language': { fr: 'Langue', en: 'Language' },
  'create.extraInstructions': { fr: 'Instructions supplémentaires (optionnel)', en: 'Additional instructions (optional)' },
  'create.emojis': { fr: 'Inclure des emojis', en: 'Include emojis' },
  'create.generate': { fr: 'Générer avec l\'IA', en: 'Generate with AI' },
  'create.generating': { fr: 'Génération en cours...', en: 'Generating...' },
  'create.preview': { fr: 'Aperçu par plateforme', en: 'Platform preview' },
  'create.schedule': { fr: 'Programmer', en: 'Schedule' },
  'create.save': { fr: 'Sauvegarder', en: 'Save' },
  'create.readyTitle': { fr: 'Prêt à créer', en: 'Ready to create' },
  'create.readyDesc': { fr: 'Remplissez le formulaire et cliquez sur « Générer » pour voir vos posts apparaître ici.', en: 'Fill in the form and click "Generate" to see your posts appear here.' },
  'create.newPost': { fr: 'Nouveau post', en: 'New post' },
  'create.copy': { fr: 'Copier', en: 'Copy' },
  'create.edit': { fr: 'Modifier', en: 'Edit' },
  'create.apply': { fr: 'Appliquer', en: 'Apply' },

  // ─── Tones ───
  'tone.professionnel': { fr: 'Professionnel', en: 'Professional' },
  'tone.decontracte': { fr: 'Décontracté', en: 'Casual' },
  'tone.inspirant': { fr: 'Inspirant', en: 'Inspiring' },
  'tone.humoristique': { fr: 'Humoristique', en: 'Humorous' },
  'tone.educatif': { fr: 'Éducatif', en: 'Educational' },
  'tone.promotionnel': { fr: 'Promotionnel', en: 'Promotional' },

  // ─── Emoji options ───
  'emoji.moderate': { fr: 'Oui, modérément', en: 'Yes, moderately' },
  'emoji.lots': { fr: 'Oui, beaucoup', en: 'Yes, lots' },
  'emoji.none': { fr: 'Non', en: 'No' },

  // ─── Languages ───
  'lang.fr': { fr: 'Français', en: 'French' },
  'lang.en': { fr: 'Anglais', en: 'English' },
  'lang.es': { fr: 'Espagnol', en: 'Spanish' },
  'lang.bilingual': { fr: 'Bilingue FR/EN', en: 'Bilingual FR/EN' },

  // ─── Calendar ───
  'cal.today': { fr: 'Aujourd\'hui', en: 'Today' },
  'cal.mon': { fr: 'Lun', en: 'Mon' },
  'cal.tue': { fr: 'Mar', en: 'Tue' },
  'cal.wed': { fr: 'Mer', en: 'Wed' },
  'cal.thu': { fr: 'Jeu', en: 'Thu' },
  'cal.fri': { fr: 'Ven', en: 'Fri' },
  'cal.sat': { fr: 'Sam', en: 'Sat' },
  'cal.sun': { fr: 'Dim', en: 'Sun' },
  'cal.scheduleTitle': { fr: 'Programmer la publication', en: 'Schedule publication' },
  'cal.date': { fr: 'Date', en: 'Date' },
  'cal.time': { fr: 'Heure', en: 'Time' },

  // ─── Library ───
  'lib.title': { fr: 'Bibliothèque de contenus', en: 'Content library' },
  'lib.all': { fr: 'Tous', en: 'All' },
  'lib.drafts': { fr: 'Brouillons', en: 'Drafts' },
  'lib.allClients': { fr: 'Tous les clients', en: 'All clients' },
  'lib.platform': { fr: 'Plateforme', en: 'Platform' },
  'lib.content': { fr: 'Contenu', en: 'Content' },
  'lib.status': { fr: 'Statut', en: 'Status' },
  'lib.date': { fr: 'Date', en: 'Date' },
  'lib.empty': { fr: 'Aucun contenu', en: 'No content' },
  'lib.emptyDesc': { fr: 'Créez votre premier post avec le générateur IA.', en: 'Create your first post with the AI generator.' },

  // ─── Status ───
  'status.draft': { fr: 'Brouillon', en: 'Draft' },
  'status.scheduled': { fr: 'Programmé', en: 'Scheduled' },
  'status.published': { fr: 'Publié', en: 'Published' },
  'status.failed': { fr: 'Échoué', en: 'Failed' },

  // ─── Clients ───
  'clients.title': { fr: 'Profils Clients', en: 'Client Profiles' },
  'clients.add': { fr: 'Ajouter un client', en: 'Add a client' },
  'clients.new': { fr: 'Nouveau client', en: 'New client' },
  'clients.modify': { fr: 'Modifier', en: 'Edit' },
  'clients.companyName': { fr: 'Nom de l\'entreprise', en: 'Company name' },
  'clients.industry': { fr: 'Industrie', en: 'Industry' },
  'clients.city': { fr: 'Ville', en: 'City' },
  'clients.brandDesc': { fr: 'Description de la marque', en: 'Brand description' },
  'clients.preferredTone': { fr: 'Ton préféré', en: 'Preferred tone' },
  'clients.keywords': { fr: 'Mots-clés / Hashtags récurrents', en: 'Keywords / Recurring hashtags' },
  'clients.plan': { fr: 'Plan', en: 'Plan' },
  'clients.posts': { fr: 'posts', en: 'posts' },
  'clients.email': { fr: 'Email', en: 'Email' },
  'clients.cancel': { fr: 'Annuler', en: 'Cancel' },
  'clients.save': { fr: 'Enregistrer', en: 'Save' },

  // ─── Reports ───
  'reports.title': { fr: 'Rapports de performance', en: 'Performance Reports' },
  'reports.generate': { fr: 'Générer un rapport', en: 'Generate report' },
  'reports.send': { fr: 'Envoyer', en: 'Send' },
  'reports.sendAll': { fr: 'Envoyer tous les rapports', en: 'Send all reports' },
  'reports.frequency': { fr: 'Fréquence d\'envoi', en: 'Send frequency' },
  'reports.weekly': { fr: 'Hebdomadaire', en: 'Weekly' },
  'reports.biweekly': { fr: 'Bi-mensuel', en: 'Bi-weekly' },
  'reports.monthly': { fr: 'Mensuel', en: 'Monthly' },
  'reports.sendMode': { fr: 'Mode d\'envoi', en: 'Send mode' },
  'reports.auto': { fr: 'Automatique', en: 'Automatic' },
  'reports.manual': { fr: 'Manuel', en: 'Manual' },
  'reports.lastSent': { fr: 'Dernier envoi', en: 'Last sent' },
  'reports.noReports': { fr: 'Aucun rapport généré', en: 'No reports generated' },
  'reports.period': { fr: 'Période', en: 'Period' },
  'reports.sent': { fr: 'Envoyé', en: 'Sent' },
  'reports.pending': { fr: 'En attente', en: 'Pending' },
  'reports.download': { fr: 'Télécharger PDF', en: 'Download PDF' },

  // ─── Settings ───
  'settings.apiKey': { fr: 'Clé API Gemini', en: 'Gemini API Key' },
  'settings.apiKeyDesc': { fr: 'Clé API pour la génération de contenu IA', en: 'API key for AI content generation' },
  'settings.socialAccounts': { fr: 'Comptes Réseaux Sociaux', en: 'Social Media Accounts' },
  'settings.connected': { fr: 'Connecté', en: 'Connected' },
  'settings.notConnected': { fr: 'Non connecté', en: 'Not connected' },
  'settings.data': { fr: 'Données', en: 'Data' },
  'settings.export': { fr: 'Exporter', en: 'Export' },
  'settings.import': { fr: 'Importer', en: 'Import' },
  'settings.reset': { fr: 'Réinitialiser', en: 'Reset' },
  'settings.test': { fr: 'Tester', en: 'Test' },
  'settings.n8n': { fr: 'Intégration n8n', en: 'n8n Integration' },
  'settings.n8nDesc': { fr: 'URL du webhook n8n pour l\'automatisation', en: 'n8n webhook URL for automation' },
  'settings.reportConfig': { fr: 'Configuration des rapports', en: 'Report configuration' },
  'settings.language': { fr: 'Langue de l\'interface', en: 'Interface language' },

  // ─── Auth ───
  'auth.login': { fr: 'Connexion', en: 'Login' },
  'auth.email': { fr: 'Adresse e-mail', en: 'Email address' },
  'auth.password': { fr: 'Mot de passe', en: 'Password' },
  'auth.signIn': { fr: 'Se connecter', en: 'Sign in' },
  'auth.logout': { fr: 'Déconnexion', en: 'Log out' },

  // ─── Onboarding ───
  'onboard.title': { fr: 'Configurez vos réseaux sociaux', en: 'Set up your social accounts' },
  'onboard.subtitle': { fr: 'Remplissez ce formulaire pour permettre à notre IA de gérer vos comptes.', en: 'Fill out this form to allow our AI to manage your accounts.' },
  'onboard.companyInfo': { fr: 'Informations de l\'entreprise', en: 'Company information' },
  'onboard.socialInfo': { fr: 'Comptes réseaux sociaux', en: 'Social media accounts' },
  'onboard.username': { fr: 'Nom d\'utilisateur', en: 'Username' },
  'onboard.pageUrl': { fr: 'URL de la page', en: 'Page URL' },
  'onboard.accessInfo': { fr: 'Informations d\'accès', en: 'Access information' },
  'onboard.submit': { fr: 'Envoyer la configuration', en: 'Submit configuration' },
  'onboard.success': { fr: 'Configuration enregistrée ! Notre équipe va configurer vos comptes sous 24h.', en: 'Configuration saved! Our team will set up your accounts within 24h.' },
  'onboard.brandDesc': { fr: 'Décrivez votre entreprise, ses valeurs, son public cible...', en: 'Describe your company, its values, target audience...' },
  'onboard.keywords': { fr: 'Mots-clés et hashtags récurrents', en: 'Recurring keywords and hashtags' },
  'onboard.tone': { fr: 'Ton de communication préféré', en: 'Preferred communication tone' },

  // ─── Common ───
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.copied': { fr: 'Copié !', en: 'Copied!' },
  'common.error': { fr: 'Erreur', en: 'Error' },
  'common.success': { fr: 'Succès', en: 'Success' },
  'common.loading': { fr: 'Chargement...', en: 'Loading...' },
  'common.confirm': { fr: 'Confirmer', en: 'Confirm' },
};

export function t(key: string, lang: Lang = 'fr'): string {
  return translations[key]?.[lang] || key;
}

export function getMonthNames(lang: Lang): string[] {
  if (lang === 'en') return ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
}

export function getAllTranslations(lang: Lang): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(translations)) {
    result[key] = val[lang];
  }
  return result;
}
