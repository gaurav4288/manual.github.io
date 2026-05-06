import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Moon, Sun, Menu, X } from 'lucide-react';
import readmeContent from '../readme.md?raw';

function App() {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  // Extract headings for Sidebar
  const headings = readmeContent
    .split('\n')
    .filter(line => line.startsWith('## ') || line.startsWith('### '))
    .map(line => {
      const level = line.startsWith('### ') ? 3 : 2;
      const title = line.replace(/^#+\s/, '');
      // Create slug exactly how GitHub creates IDs for headers
      const id = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return { id, title, level };
    });

  // Handle system preference or stored theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Setup intersection observer to highlight active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );

    const headingElements = document.querySelectorAll('h2, h3');
    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Custom components for react-markdown to add IDs to headers
  const components = {
    h2: ({ node, children }) => {
      const id = children[0]?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h2 id={id}>{children}</h2>;
    },
    h3: ({ node, children }) => {
      const id = children[0]?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h3 id={id}>{children}</h3>;
    },
    // Rewrite image sources to work from public folder
    img: ({ node, src, alt }) => {
      // If it's a relative path like 'asset/img.png', Vite serves it from root if it's in public/asset
      const imgSrc = src.startsWith('http') ? src : `/${src}`;
      return <img src={imgSrc} alt={alt} loading="lazy" />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">TMS Manual</div>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <nav className="nav-links">
          {headings.map((heading, idx) => (
            <a
              key={idx}
              href={`#${heading.id}`}
              className={`nav-link ${heading.level === 3 ? 'level-2' : ''} ${
                activeId === heading.id ? 'active' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile Toggle Button */}
      <button className="mobile-nav-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Markdown Content */}
      <main className="main-content">
        <div className="markdown-body">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={components}
          >
            {readmeContent}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}

export default App;
