import React from 'react';
import { motion } from 'framer-motion';

// --- Data ---
const PROFILE_DATA = {
  name: "Wallace Barbosa",
  title: "Especialista em Soluções Digitais & Automação com IA",
  location: "Rio de Janeiro, Brasil",
  phone: "21994152560",
  summary: "Transformo fluxos de trabalho lentos em processos automáticos e inteligentes. Com foco total em produtividade, ajudo profissionais a ganharem tempo e eficiência através da tecnologia.",
  experience: [
    {
      company: "Procuradoria Geral do Estado do Rio de Janeiro (PGE-RJ)",
      role: "Especialista em Inovação & Analista",
      period: "Fev 2023 - O momento",
      description: "Implementação de sistemas inteligentes que agilizam processos jurídicos e administrativos, trazendo mais velocidade e precisão para o setor público."
    },
    {
      company: "HBM Proteção Veicular",
      role: "Desenvolvedor de Sistemas",
      period: "Jan 2024 - Jun 2024",
      description: "Criação de ferramentas digitais focadas em facilitar o dia a dia da empresa e melhorar o atendimento ao cliente final."
    }
  ],
  skills: [
    { title: "Inteligência Artificial para Negócios", desc: "Uso de ferramentas como o ChatGPT para automatizar tarefas repetitivas e gerar documentos em segundos." },
    { title: "Sistemas Sob Medida", desc: "Criação de plataformas fáceis de usar que resolvem os problemas específicos da sua rotina." },
    { title: "Modernização Digital", desc: "Transformação de processos manuais (papel e planilhas) em sistemas digitais seguros e acessíveis." }
  ],
  certifications: [
    { title: "ChatGPT e outras IAs na Advocacia Pública", issuer: "PGE-RJ", date: "Out 2024" },
    { title: "Scrum Fundamentals Certified (SFC™)", issuer: "SCRUMstudy", date: "" }
  ],
  languages: ["Português (Nativo)", "Inglês (Básico)"],
  projects: [
    {
      title: "Automação Jurídica (PGE-RJ)",
      desc: "Projeto focado em reduzir a burocracia através de inteligência artificial.",
      link: "#"
    },
    {
      title: "Gestão Inteligente",
      desc: "Sistema de monitoramento e organização de dados com interface simples e direta.",
      link: "#"
    }
  ]
};

// --- Components ---

const Hero = () => (
  <section className="hero">
    <div className="container">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="hero-badge">Disponível para Projetos Estratégicos</span>
        <h1>Sua rotina mais <span className="text-gradient">simples</span> e inteligente</h1>
        <p>
          Sou {PROFILE_DATA.name}. Ajudo profissionais e empresas a eliminarem a burocracia 
          e ganharem tempo através de automações com Inteligência Artificial.
        </p>
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={`https://wa.me/55${PROFILE_DATA.phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Falar no WhatsApp</a>
          <a href="#solucoes" className="btn" style={{ border: '1px solid var(--border)' }}>Como funciona?</a>
        </div>
      </motion.div>
    </div>
  </section>
);

const Solutions = () => (
  <section id="solucoes" style={{ background: '#fff' }}>
    <div className="container">
      <h2>Como posso te <span className="text-gradient">ajudar</span>?</h2>
      <div className="grid-features">
        {PROFILE_DATA.skills.map((skill, index) => (
          <motion.div 
            key={index} 
            className="card"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{skill.title}</h3>
            <p>{skill.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Experience = () => (
  <section id="sobre">
    <div className="container">
      <h2 style={{ marginBottom: '3rem' }}>Experiência <span className="text-gradient">Profissional</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {PROFILE_DATA.experience.map((exp, index) => (
          <motion.div 
            key={index} 
            className="experience-item"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
          >
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{exp.role}</h3>
            <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{exp.company}</p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>{exp.period}</p>
            <p>{exp.description}</p>
          </motion.div>
        ))}
      </div>
      
      <div className="card" style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div>
          <h3>Formação Acadêmica</h3>
          <p>Tecnólogo em Tecnologia da Informação</p>
          <p style={{ fontSize: '0.9rem' }}>Universidade Veiga de Almeida • Ago 2022 - Dez 2026</p>
        </div>
        <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '2rem' }}>
          <h3>Certificações</h3>
          {PROFILE_DATA.certifications.map((cert, i) => (
            <div key={i} style={{ marginBottom: '0.8rem' }}>
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{cert.title}</p>
              <p style={{ fontSize: '0.85rem' }}>{cert.issuer} {cert.date && `• ${cert.date}`}</p>
            </div>
          ))}
        </div>
        <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '2rem' }}>
          <h3>Idiomas</h3>
          {PROFILE_DATA.languages.map((lang, i) => (
            <p key={i} style={{ fontSize: '0.95rem' }}>{lang}</p>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Portfolio = () => (
  <section id="projetos" style={{ background: '#fff' }}>
    <div className="container">
      <h2>Projetos em <span className="text-gradient">Destaque</span></h2>
      <div className="grid-features">
        {PROFILE_DATA.projects.map((project, index) => (
          <motion.div 
            key={index} 
            className="card"
            whileHover={{ scale: 1.02 }}
          >
            <h3 style={{ marginBottom: '1rem' }}>{project.title}</h3>
            <p style={{ marginBottom: '1.5rem' }}>{project.desc}</p>
            <a href={project.link} className="text-gradient" style={{ fontWeight: '600', textDecoration: 'none' }}>Ver detalhes →</a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contato" className="footer">
    <div className="container">
      <h2 style={{ marginBottom: '1rem' }}>Vamos transformar seu trabalho?</h2>
      <p style={{ marginBottom: '2.5rem' }}>Entre em contato e descubra como a tecnologia pode trabalhar para você.</p>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={`https://wa.me/55${PROFILE_DATA.phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Chamar no WhatsApp
        </a>
        <a href="mailto:wallacedasilva.barbosa@gmail.com" className="btn" style={{ border: '1px solid var(--border)' }}>
          Enviar E-mail
        </a>
      </div>
      <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>
          Feito com muito ☕ e ❤️ por {PROFILE_DATA.name}
        </p>
        <p style={{ fontSize: '0.8rem' }}>© {new Date().getFullYear()} • Todos os direitos reservados</p>
      </div>
    </div>
  </section>
);

function App() {
  return (
    <div className="app">
      <Hero />
      <Solutions />
      <Experience />
      <Portfolio />
      <Contact />
    </div>
  );
}

export default App;
