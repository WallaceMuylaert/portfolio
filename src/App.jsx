import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Workflow, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Menu,
  X,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import profileImg from './assets/profile.jpg';

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
      description: "Minha jornada na PGE-RJ é de muito orgulho e dedicação. Comecei como estagiário, movido pela vontade de usar a tecnologia para resolver problemas reais e desburocratizar a rotina jurídica. Graças ao impacto do meu trabalho, fui reconhecido e efetivado como Analista. Hoje, implemento sistemas inteligentes que trazem agilidade, precisão e modernidade para o setor público."
    },
    {
      company: "HBM Proteção Veicular",
      role: "Desenvolvedor de Sistemas",
      period: "Jan 2024 - Jun 2024",
      description: "Criação de ferramentas digitais focadas em facilitar o dia a dia da empresa e melhorar o atendimento ao cliente final."
    }
  ],
  skills: [
    { 
      icon: <Bot size={28} />, 
      title: "Inteligência Artificial para Negócios", 
      desc: "Uso de ferramentas como o ChatGPT para automatizar tarefas repetitivas e gerar documentos em segundos." 
    },
    { 
      icon: <Workflow size={28} />, 
      title: "Sistemas Sob Medida", 
      desc: "Criação de plataformas fáceis de usar que resolvem os problemas específicos da sua rotina." 
    },
    { 
      icon: <Zap size={28} />, 
      title: "Modernização Digital", 
      desc: "Transformação de processos manuais (papel e planilhas) em sistemas digitais seguros e acessíveis." 
    }
  ],
  certifications: [
    { title: "ChatGPT e outras IAs na Advocacia Pública", issuer: "PGE-RJ", date: "Out 2024" },
    { title: "Scrum Fundamentals Certified (SFC™)", issuer: "SCRUMstudy", date: "" }
  ],
  languages: ["Português (Nativo)", "Inglês (Básico)"],
  projects: [
    {
      icon: <Globe size={24} />,
      title: "Redação Yana",
      desc: "Sistema sob medida desenvolvido para atender as necessidades específicas da professora Yana, focado na organização e gestão eficiente de suas turmas.",
      tags: ["Plataforma Digital", "Educação"],
      link: "https://redacaoyana.com.br"
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Romaneio Rápido",
      desc: "Sistema robusto de gestão de fretes e romaneios, simplificando a logística de empresas de transporte.",
      tags: ["Gestão", "Logística"],
      link: "https://romaneiorapido.com.br/"
    },
    {
      icon: <Zap size={24} />,
      title: "Pig Scoreboard",
      desc: "Placar digital interativo e moderno, com atualizações em tempo real e foco total em acessibilidade.",
      tags: ["Aplicação Web", "UX/UI"],
      link: "https://pig-scoreboard.netlify.app/"
    }
  ],
  faq: [
    { q: "A tecnologia é segura para dados sensíveis?", a: "Sim. Todas as soluções são desenvolvidas seguindo as melhores práticas de segurança e privacidade, garantindo que informações confidenciais permaneçam protegidas." },
    { q: "Preciso entender de tecnologia para usar?", a: "Absolutamente não. Meu foco é criar interfaces tão simples quanto usar um aplicativo de mensagens. Eu cuido da complexidade para que você foque no seu trabalho." },
    { q: "Quanto tempo demora para implementar uma automação?", a: "Depende do fluxo, mas muitas soluções de impacto imediato podem ser entregues em poucos dias, permitindo que você já comece a ganhar tempo na mesma semana." }
  ]
};

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <a href="#" className="nav-brand">
          <User size={24} color="var(--primary)" />
          Wallace Barbosa
        </a>
        
        {/* Desktop Links */}
        <div className="nav-links">
          <a href="#solucoes">Soluções</a>
          <a href="#experiencia">Trajetória</a>
          <a href="#projetos">Cases</a>
          <a href="#contato" style={{ color: 'var(--primary)', fontWeight: '600' }}>Contato</a>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} color="var(--primary)" /> : <Menu size={28} color="var(--primary)" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <a href="#solucoes" onClick={() => setIsOpen(false)}>Soluções</a>
            <a href="#experiencia" onClick={() => setIsOpen(false)}>Trajetória</a>
            <a href="#projetos" onClick={() => setIsOpen(false)}>Cases</a>
            <a href="#contato" onClick={() => setIsOpen(false)} style={{ color: 'var(--primary)', fontWeight: '600' }}>Contato</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => (
  <section className="hero">
    <div className="container hero-grid">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="hero-badge">
          <CheckCircle2 size={16} /> Disponível para Consultoria Estratégica
        </span>
        <h1>Sua rotina mais <span className="text-gradient">simples</span> e inteligente</h1>
        <p>
          Sou {PROFILE_DATA.name}. Ajudo profissionais e empresas a eliminarem a burocracia 
          e ganharem tempo através de automações e tecnologia sob medida.
        </p>
        <div className="btn-group">
          <a href={`https://wa.me/55${PROFILE_DATA.phone}?text=Ol%C3%A1%2C%20Wallace!%20Acessei%20o%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20saber%20mais%20sobre...`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Phone size={20} /> Falar no WhatsApp
          </a>
          <a href="#solucoes" className="btn btn-secondary">
            Como funciona?
          </a>
        </div>
      </motion.div>
      
      <motion.div 
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="avatar-container">
          <img 
            src={profileImg} 
            alt="Wallace Barbosa" 
          />
        </div>
      </motion.div>
    </div>
  </section>
);

const Solutions = () => (
  <section id="solucoes" style={{ background: '#fff' }}>
    <div className="container">
      <h2>O que eu posso fazer <span className="text-gradient">pelo seu negócio?</span></h2>
      <div className="grid-cards">
        {PROFILE_DATA.skills.map((skill, index) => (
          <motion.div 
            key={index} 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
          >
            <div className="icon-wrapper">
              {skill.icon}
            </div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>{skill.title}</h3>
            <p>{skill.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Experience = () => (
  <section id="experiencia">
    <div className="container">
      <h2 style={{ marginBottom: '4rem' }}>Minha <span className="text-gradient">Trajetória</span></h2>
      
      <div className="timeline">
        {PROFILE_DATA.experience.map((exp, index) => (
          <motion.div 
            key={index} 
            className="timeline-item"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="timeline-icon">
              <Briefcase size={24} />
            </div>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{exp.role}</h3>
              <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{exp.company}</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>{exp.period}</p>
              <p>{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Formação e Certificações */}
      <div style={{ marginTop: '5rem' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.8rem' }}>Formação & Especializações</h3>
        <div className="grid-cards">
          
          <div className="card">
            <div className="icon-wrapper" style={{ width: '48px', height: '48px' }}>
              <GraduationCap size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Tecnólogo em TI</h4>
            <p style={{ fontSize: '0.95rem' }}>Universidade Veiga de Almeida</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem' }}>Ago 2022 - Dez 2026</p>
          </div>

          <div className="card">
            <div className="icon-wrapper" style={{ width: '48px', height: '48px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Certificações</h4>
            {PROFILE_DATA.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: '0.8rem' }}>
                <p style={{ fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.3' }}>{cert.title}</p>
                <p style={{ fontSize: '0.85rem' }}>{cert.issuer} {cert.date && `• ${cert.date}`}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="icon-wrapper" style={{ width: '48px', height: '48px' }}>
              <Globe size={24} />
            </div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Idiomas</h4>
            {PROFILE_DATA.languages.map((lang, i) => (
              <p key={i} style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>• {lang}</p>
            ))}
          </div>

        </div>
      </div>
    </div>
  </section>
);

const Portfolio = () => (
  <section id="projetos" style={{ background: '#fff' }}>
    <div className="container">
      <h2>Casos de <span className="text-gradient">Sucesso</span></h2>
      <div className="grid-cards">
        {PROFILE_DATA.projects.map((project, index) => (
          <motion.div 
            key={index} 
            className="card"
            whileHover={{ y: -5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--primary)' }}>
                {project.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>{project.title}</h3>
            </div>
            <p style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{project.desc}</p>
            <div style={{ marginBottom: '1.5rem' }}>
              {project.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
            {project.link && (
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Globe size={16} /> Acessar Projeto
                </a>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = () => (
  <section id="faq">
    <div className="container">
      <h2>Dúvidas <span className="text-gradient">Frequentes</span></h2>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {PROFILE_DATA.faq.map((item, index) => (
          <motion.div 
            key={index} 
            className="card" 
            style={{ marginBottom: '1.5rem', padding: '1.5rem 2rem', textAlign: 'left', alignItems: 'flex-start' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <HelpCircle size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{item.q}</h4>
                <p style={{ fontSize: '1rem' }}>{item.a}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contato" className="footer">
    <div className="container">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Pronto para focar no que realmente importa?</h2>
      <p style={{ marginBottom: '3rem', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Deixe a burocracia com a tecnologia e foque em resultados. Entre em contato para descobrirmos a melhor solução para você.
      </p>
      
      <div className="btn-group" style={{ justifyContent: 'center' }}>
        <a href={`https://wa.me/55${PROFILE_DATA.phone}?text=Ol%C3%A1%2C%20Wallace!%20Acessei%20o%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20saber%20mais%20sobre...`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Phone size={20} /> Chamar no WhatsApp
        </a>
        <a href="mailto:wallacedasilva.barbosa@gmail.com" className="btn btn-secondary">
          <Mail size={20} /> Enviar E-mail
        </a>
      </div>
      
      <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '1rem' }}>
          Feito com muito ☕ e ❤️ por {PROFILE_DATA.name}
        </p>
        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          © {new Date().getFullYear()} • Todos os direitos reservados
        </p>
      </div>
    </div>
  </section>
);

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Solutions />
      <Experience />
      <Portfolio />
      <FAQ />
      <Contact />
      
      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/55${PROFILE_DATA.phone}?text=Ol%C3%A1%2C%20Wallace!%20Acessei%20o%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20saber%20mais%20sobre...`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}

export default App;
