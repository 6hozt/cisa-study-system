// ─── Resource library ─────────────────────────────────────────────────────────
// Keys must match plan.certification_id and section.name exactly.
// Free sections are omitted when there is no genuinely strong free option.
// URLs are only included where we are confident they are correct and stable.

export const RESOURCE_LIBRARY = {
  cisa: {
    'Domain 1': {
      free: [
        {
          name: 'ISACA Free Sample Questions',
          description: 'Official practice questions from the exam body',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
        },
        {
          name: 'ITPro.TV Free Trial',
          description: 'Video walkthroughs of IS auditing concepts — covers Domain 1 thoroughly',
          where: 'itpro.tv (free trial, no credit card required)',
        },
      ],
      paid: [
        {
          name: 'ISACA QAE Database',
          description: 'The official question, answer & explanation database — closest to the real exam',
          price: '$199',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'ISACA CISA Review Manual',
          description: 'The authoritative reference book from the exam body',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: "Mike Chapple's CISA Study Guide",
          description: 'Highly rated Sybex guide with practice exams',
          publisher: 'Sybex / Wiley',
        },
      ],
    },
    'Domain 2': {
      free: [
        {
          name: 'ISACA Free Webinars',
          description: 'Periodic free webinars covering IT governance frameworks',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'COBIT Framework Documentation',
          description: 'The COBIT framework underpins this entire domain — read the free overview',
          where: 'isaca.org (COBIT section)',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
      ],
      paid: [
        {
          name: 'ISACA QAE Database',
          description: 'Official question bank — essential for all 5 domains',
          price: '$199',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'Hemang Doshi CISA Course',
          description: 'Highly rated, domain-by-domain video course at a fraction of ISACA prices',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/cisa/',
        },
      ],
    },
    'Domain 3': {
      free: [
        {
          name: 'ISACA Free Sample Questions',
          description: 'Official sample questions for IS acquisition and development topics',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
        },
      ],
      paid: [
        {
          name: 'ISACA QAE Database',
          description: 'Official question bank',
          price: '$199',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'Hemang Doshi CISA Course',
          description: 'Covers Domain 3 with practical SDLC and project management context',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/cisa/',
        },
      ],
    },
    'Domain 4': {
      free: [
        {
          name: 'ISACA Free Sample Questions',
          description: 'Official sample questions for IS operations and resilience topics',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
        },
      ],
      paid: [
        {
          name: 'ISACA QAE Database',
          description: 'Official question bank',
          price: '$199',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'Hemang Doshi CISA Course',
          description: 'Strong coverage of business continuity and disaster recovery for this domain',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/cisa/',
        },
      ],
    },
    'Domain 5': {
      free: [
        {
          name: 'NIST Cybersecurity Framework',
          description: 'Free authoritative documentation directly relevant to information asset protection',
          where: 'nist.gov/cyberframework',
          url: 'https://www.nist.gov/cyberframework',
        },
      ],
      paid: [
        {
          name: 'ISACA QAE Database',
          description: 'Official question bank',
          price: '$199',
          where: 'isaca.org',
          url: 'https://www.isaca.org/credentialing/cisa',
        },
        {
          name: 'Hemang Doshi CISA Course',
          description: 'Covers cryptography, access controls, and security monitoring for Domain 5',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/cisa/',
        },
      ],
    },
  },

  'comptia-sec': {
    Threats: {
      free: [
        {
          name: 'Professor Messer SY0-701 Course',
          description: 'Genuinely excellent free video course — the Threats section videos are among the best available anywhere.',
          where: 'YouTube or professormesser.com',
          url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
        },
      ],
      paid: [
        {
          name: 'Jason Dion Security+ Course',
          description: 'Highly structured video course with abundant practice questions',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/comptia-security-plus/',
        },
        {
          name: "Mike Chapple Security+ Study Guide",
          description: 'Comprehensive Sybex study guide with practice exams included',
          publisher: 'Sybex / Wiley',
        },
      ],
    },
    Architecture: {
      free: [
        {
          name: 'Professor Messer SY0-701 Course',
          description: 'Architecture and Design section is clearly explained with real-world examples',
          where: 'YouTube or professormesser.com',
          url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
        },
      ],
      paid: [
        {
          name: 'Jason Dion Security+ Course',
          description: 'In-depth architecture and design modules with hands-on labs',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/comptia-security-plus/',
        },
      ],
    },
    Implementation: {
      free: [
        {
          name: 'Professor Messer SY0-701 Course',
          description: 'Implementation topics — protocols, PKI, wireless — explained clearly and free',
          where: 'YouTube or professormesser.com',
          url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
        },
      ],
      paid: [
        {
          name: 'Jason Dion Security+ Course',
          description: 'Strongest paid option for implementation — includes lab simulations',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/comptia-security-plus/',
        },
        {
          name: 'CertMaster Learn by CompTIA',
          description: 'Official CompTIA adaptive learning platform with performance-based questions',
          where: 'comptia.org',
        },
      ],
    },
    Operations: {
      free: [
        {
          name: 'Professor Messer SY0-701 Course',
          description: 'Incident response procedures and forensics covered in detail',
          where: 'YouTube or professormesser.com',
          url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
        },
        {
          name: 'NIST SP 800-61 Incident Response Guide',
          description: 'Free authoritative guide directly tested on the exam — worth reading the summary sections',
          where: 'nist.gov/publications',
          url: 'https://www.nist.gov/publications',
        },
      ],
      paid: [
        {
          name: 'Jason Dion Security+ Course',
          description: 'Strong incident response and threat hunting coverage',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/comptia-security-plus/',
        },
      ],
    },
    Governance: {
      free: [
        {
          name: 'Professor Messer SY0-701 Course',
          description: 'Frameworks, compliance, and policies explained with exam-focused clarity',
          where: 'YouTube or professormesser.com',
          url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
        },
        {
          name: 'NIST Cybersecurity Framework',
          description: 'Free framework documentation — understanding CSF deeply pays off on GRC questions',
          where: 'nist.gov/cyberframework',
          url: 'https://www.nist.gov/cyberframework',
        },
      ],
      paid: [
        {
          name: 'Jason Dion Security+ Course',
          description: 'Covers regulations (GDPR, HIPAA, PCI-DSS) and risk management in detail',
          where: 'Udemy',
          url: 'https://www.udemy.com/topic/comptia-security-plus/',
        },
        {
          name: 'CertMaster Learn by CompTIA',
          description: 'Official platform with GRC-focused performance-based question simulations',
          where: 'comptia.org',
        },
      ],
    },
  },
}

// ─── Time block tasks ─────────────────────────────────────────────────────────
// Specific task labels and URLs for each time block per cert + section.
// video  → primary study/watch task
// practice → active recall / question practice task
// review  → consolidation / notes task (no URL needed)

const TIME_BLOCKS = {
  cisa: {
    'Domain 1': {
      video: {
        label: 'Hemang Doshi CISA – Domain 1: IS Auditing Process',
        url: 'https://www.udemy.com/topic/cisa/',
      },
      practice: {
        label: 'ISACA Free Sample Questions – Domain 1: IS Auditing Process',
        url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
      },
      review: {
        label: 'Review notes: Audit planning, standards & guidelines, evidence gathering & risk assessment',
      },
    },
    'Domain 2': {
      video: {
        label: 'Hemang Doshi CISA – Domain 2: Governance & Management of IT',
        url: 'https://www.udemy.com/topic/cisa/',
      },
      practice: {
        label: 'ISACA Free Sample Questions – Domain 2: Governance & IT Management',
        url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
      },
      review: {
        label: 'Review notes: IT governance frameworks, COBIT principles & IT strategy alignment',
      },
    },
    'Domain 3': {
      video: {
        label: 'Hemang Doshi CISA – Domain 3: IS Acquisition, Development & Implementation',
        url: 'https://www.udemy.com/topic/cisa/',
      },
      practice: {
        label: 'ISACA Free Sample Questions – Domain 3: IS Acquisition & Development',
        url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
      },
      review: {
        label: 'Review notes: SDLC methodologies, project management controls, testing & QA',
      },
    },
    'Domain 4': {
      video: {
        label: 'Hemang Doshi CISA – Domain 4: IS Operations & Business Resilience',
        url: 'https://www.udemy.com/topic/cisa/',
      },
      practice: {
        label: 'ISACA Free Sample Questions – Domain 4: IS Operations & Business Resilience',
        url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
      },
      review: {
        label: 'Review notes: IT operations management, disaster recovery planning & business continuity',
      },
    },
    'Domain 5': {
      video: {
        label: 'Hemang Doshi CISA – Domain 5: Protection of Information Assets',
        url: 'https://www.udemy.com/topic/cisa/',
      },
      practice: {
        label: 'ISACA Free Sample Questions – Domain 5: Protection of Information Assets',
        url: 'https://www.isaca.org/credentialing/cisa/cisa-exam-resources',
      },
      review: {
        label: 'Review notes: Logical & physical access controls, network security, encryption & data classification',
      },
    },
  },

  'comptia-sec': {
    Threats: {
      video: {
        label: 'Professor Messer SY0-701 – Threats, Attacks & Vulnerabilities',
        url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
      },
      practice: {
        label: 'ExamCompass – Security+ Threats & Attacks Practice Tests',
        url: 'https://www.examcompass.com/comptia/security-plus-certification/free-security-plus-practice-tests',
      },
      review: {
        label: 'Review notes: Social engineering techniques, malware types & attack vector categories',
      },
    },
    Architecture: {
      video: {
        label: 'Professor Messer SY0-701 – Architecture & Design',
        url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
      },
      practice: {
        label: 'ExamCompass – Security+ Architecture & Design Practice Tests',
        url: 'https://www.examcompass.com/comptia/security-plus-certification/free-security-plus-practice-tests',
      },
      review: {
        label: 'Review notes: Security frameworks, cloud deployment models & virtualization security concepts',
      },
    },
    Implementation: {
      video: {
        label: 'Professor Messer SY0-701 – Implementation',
        url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
      },
      practice: {
        label: 'ExamCompass – Security+ Implementation Practice Tests',
        url: 'https://www.examcompass.com/comptia/security-plus-certification/free-security-plus-practice-tests',
      },
      review: {
        label: 'Review notes: PKI, TLS/SSL, wireless security protocols & multi-factor authentication',
      },
    },
    Operations: {
      video: {
        label: 'Professor Messer SY0-701 – Operations & Incident Response',
        url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
      },
      practice: {
        label: 'ExamCompass – Security+ Operations & Incident Response Practice Tests',
        url: 'https://www.examcompass.com/comptia/security-plus-certification/free-security-plus-practice-tests',
      },
      review: {
        label: 'Review notes: Incident response lifecycle, digital forensics chain of custody & threat hunting',
      },
    },
    Governance: {
      video: {
        label: 'Professor Messer SY0-701 – Governance, Risk & Compliance',
        url: 'https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-training-course/',
      },
      practice: {
        label: 'ExamCompass – Security+ Governance, Risk & Compliance Practice Tests',
        url: 'https://www.examcompass.com/comptia/security-plus-certification/free-security-plus-practice-tests',
      },
      review: {
        label: 'Review notes: GDPR, HIPAA, PCI-DSS compliance requirements & NIST cybersecurity framework',
      },
    },
  },
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Returns { video, practice, review } time block tasks for a cert + section,
 * or null if no specific tasks are defined (caller should fall back to generic labels).
 */
export function getTimeBlocks(certificationId, sectionName) {
  return TIME_BLOCKS[certificationId]?.[sectionName] ?? null
}

/**
 * Returns { free, paid } resources for a cert + section.
 * Returns null if the cert has no library at all.
 */
export function getResources(certificationId, sectionName) {
  const certResources = RESOURCE_LIBRARY[certificationId]
  if (!certResources) return null
  return certResources[sectionName] ?? { free: [], paid: [] }
}

export function hasCertResources(certificationId) {
  return certificationId in RESOURCE_LIBRARY
}
