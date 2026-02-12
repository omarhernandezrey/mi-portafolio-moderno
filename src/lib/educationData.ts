// /lib/educationData.ts

interface EducationItem {
  title: {
    es: string;
    en: string;
  } | string;
  institution: {
    es: string;
    en: string;
  } | string;
  duration: {
    es: string;
    en: string;
  } | string;
  description: {
    es: string;
    en: string;
  } | string;
  logo: string;
  certificate?: string | null;
  isNew?: boolean;
}

interface EducationCategory {
  category: {
    es: string;
    en: string;
  } | string;
  items: EducationItem[];
}

export const educationData: EducationCategory[] = [
  {
    category: {
      es: "Universidad",
      en: "University"
    },
    items: [
      // 85 - Ingeniero de Software
      {
        title: {
          es: "Ingeniero de Software",
          en: "Software Engineer"
        },
        institution: {
          es: "Politécnico Grancolombiano",
          en: "Politécnico Grancolombiano"
        },
        duration: {
          es: "2023 - 2026",
          en: "2023 - 2026"
        },
        description: {
          es: "Próximo a graduarme como Ingeniero de Software del Politécnico Grancolombiano, donde he desarrollado sólidas competencias en desarrollo de software, arquitectura de sistemas y metodologías ágiles.",
          en: "About to graduate as a Software Engineer from Politécnico Grancolombiano, where I have developed solid competencies in software development, system architecture and agile methodologies."
        },
        logo: "/images/education/politecnico/politecnico-logo.png",
        certificate: null,
      },
    ],
  },
  {
    category: {
      es: "Formación Técnica (SENA)",
      en: "Technical Training (SENA)"
    },
    items: [
      // 84 - Tecnólogo ADSI (SENA)
      {
        title: {
          es: "Tecnólogo ADSI (SENA)",
          en: "ADSI Technologist (SENA)"
        },
        institution: {
          es: "Servicio Nacional de Aprendizaje (SENA)",
          en: "National Learning Service (SENA)"
        },
        duration: {
          es: "Finalizado el 29 de noviembre de 2022",
          en: "Completed on November 29, 2022"
        },
        description: {
          es: "Cursé y aprobé el programa de formación profesional integral en Análisis y Desarrollo de Sistemas de Información, donde desarrollé competencias en análisis, diseño, desarrollo, implementación y mantenimiento de sistemas informáticos, cumpliendo con los requisitos establecidos por el SENA.",
          en: "I completed and passed the comprehensive professional training program in Information Systems Analysis and Development, where I developed competencies in analysis, design, development, implementation and maintenance of computer systems, meeting the requirements established by SENA."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png",
      },
    ],
  },
  {
    category: {
      es: "Talento Tech Bogotá",
      en: "Talento Tech Bogotá"
    },
    items: [
      // 83 - Bootcamp en Desarrollo Web Full Stack
      {
        title: {
          es: "Bootcamp en Desarrollo Web Full Stack",
          en: "Full Stack Web Development Bootcamp"
        },
        institution: {
          es: "Talento Tech Bogotá - Ministerio TIC",
          en: "Talento Tech Bogotá - Ministry of ICT"
        },
        duration: {
          es: "159 horas (Finalizado el 27 de agosto de 2024)",
          en: "159 hours (Completed on August 27, 2024)"
        },
        description: {
          es: "Participé en el bootcamp de nivel avanzado en Desarrollo Web Full Stack, enfocado en adquirir competencias prácticas en tecnologías modernas para el desarrollo de aplicaciones web completas. Este programa se realizó en modalidad virtual.",
          en: "I participated in the advanced level Full Stack Web Development bootcamp, focused on acquiring practical competencies in modern technologies for complete web application development. This program was conducted in virtual mode."
        },
        logo: "/images/education/talento-tech/talento-tech-logo.png",
        certificate:
          "/images/education/talento-tech/desarrolloWebFullStack_page-0001.jpg",
      },
    ],
  },
  {
    category: {
      es: "ITCertificate",
      en: "ITCertificate"
    },
    items: [
      // 82 - Full Stack Developer Certified Specialist
      {
        title: {
          es: "Full Stack Developer Certified Specialist",
          en: "Full Stack Developer Certified Specialist"
        },
        institution: {
          es: "ITCertificate",
          en: "ITCertificate"
        },
        duration: {
          es: "Finalizado el 31 de octubre de 2024",
          en: "Completed on October 31, 2024"
        },
        description: {
          es: "Obtuve la certificación como especialista certificado en desarrollo web Full Stack, demostrando habilidades avanzadas en el desarrollo y gestión de aplicaciones web completas.",
          en: "I obtained certification as a certified specialist in Full Stack web development, demonstrating advanced skills in the development and management of complete web applications."
        },
        logo: "/images/education/ITCertificate/itcertificate-logo.png",
        certificate:
          "/images/education/ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg",
      },
      // 81 - Back End Developer Certified Professional
      {
        title: {
          es: "Back End Developer Certified Professional",
          en: "Back End Developer Certified Professional"
        },
        institution: {
          es: "ITCertificate",
          en: "ITCertificate"
        },
        duration: {
          es: "Finalizado el 31 de octubre de 2024",
          en: "Completed on October 31, 2024"
        },
        description: {
          es: "Obtuve la certificación como profesional certificado en desarrollo Back End, demostrando habilidades avanzadas en la creación, gestión y optimización de servidores, bases de datos y lógica de aplicaciones.",
          en: "I obtained certification as a certified professional in Back End development, demonstrating advanced skills in creating, managing and optimizing servers, databases and application logic."
        },
        logo: "/images/education/ITCertificate/itcertificate-logo.png",
        certificate:
          "/images/education/ITCertificate/backEndDeveloperCertifiedProfessional_page-0001.jpg",
      },
    ],
  },
  {
    category: {
      es: "Cursos en Línea (SENA),(Platzi) y mas...",
      en: "Online Courses (SENA),(Platzi) and more..."
    },
    items: [
      // 80 - Metodología de la Programación de Sistemas Informáticos
      {
        title: {
          es: "Metodología de la Programación de Sistemas Informáticos",
          en: "Computer Systems Programming Methodology"
        },
        institution: {
          es: "Servicio Nacional de Aprendizaje (SENA)",
          en: "National Learning Service (SENA)"
        },
        duration: {
          es: "40 horas (Finalizado el 21 de marzo de 2023)",
          en: "40 hours (Completed on March 21, 2023)"
        },
        description: {
          es: "Cursé y aprobé la formación en Metodología de la Programación de Sistemas Informáticos, adquiriendo conocimientos fundamentales en el diseño, desarrollo y análisis de sistemas informáticos.",
          en: "I completed and passed the training in Computer Systems Programming Methodology, acquiring fundamental knowledge in the design, development and analysis of computer systems."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/02certificadoAprobacionMetodologiaDeLaProgramacionDeSistemasInformaticos.png",
      },
      // 79 - Construcción de Bases de Datos con MySQL
      {
        title: {
          es: "Construcción de Bases de Datos con MySQL",
          en: "MySQL Database Construction"
        },
        institution: {
          es: "Servicio Nacional de Aprendizaje (SENA)",
          en: "National Learning Service (SENA)"
        },
        duration: {
          es: "48 horas (Finalizado el 8 de mayo de 2023)",
          en: "48 hours (Completed on May 8, 2023)"
        },
        description: {
          es: "Cursé y aprobé la formación en Construcción de Bases de Datos con MySQL, desarrollando habilidades para diseñar, implementar y gestionar bases de datos relacionales utilizando MySQL.",
          en: "I completed and passed the training in MySQL Database Construction, developing skills to design, implement and manage relational databases using MySQL."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/03certificadoAprobacionConstruccionDeBasesDeDatosConMysql.png",
      },
      // 78 - Atender Clientes de Acuerdo con Procedimiento de Servicio y Normativa
      {
        title: {
          es: "Atender Clientes de Acuerdo con Procedimiento de Servicio y Normativa - Nivel Intermedio",
          en: "Customer Service According to Service Procedures and Regulations - Intermediate Level"
        },
        institution: {
          es: "Servicio Nacional de Aprendizaje (SENA)",
          en: "National Learning Service (SENA)"
        },
        duration: {
          es: "Certificación de Competencia Laboral (Emitido el 22 de octubre de 2020, vigente hasta el 22 de octubre de 2023)",
          en: "Labor Competency Certification (Issued on October 22, 2020, valid until October 22, 2023)"
        },
        description: {
          es: "Certificado de competencia laboral que acredita habilidades intermedias para atender clientes conforme a procedimientos de servicio y normativas vigentes, demostrando competencias en atención al cliente y gestión administrativa.",
          en: "Labor competency certificate that accredits intermediate skills to serve customers according to service procedures and current regulations, demonstrating competencies in customer service and administrative management."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/04certificadoAprobacionCompetenciaLaboral.png",
      },
      // 77 - Mentalidad de Líder
      {
        title: {
          es: "Mentalidad de Líder",
          en: "Leadership Mindset"
        },
        institution: {
          es: "Servicio Nacional de Aprendizaje (SENA)",
          en: "National Learning Service (SENA)"
        },
        duration: {
          es: "20 horas (Finalizado el 20 de enero de 2011)",
          en: "20 hours (Completed on January 20, 2011)"
        },
        description: {
          es: "Cursé y aprobé la formación en Mentalidad de Líder, adquiriendo competencias en liderazgo, gestión de equipos y habilidades estratégicas para impulsar el desarrollo personal y profesional.",
          en: "I completed and passed the Leadership Mindset training, acquiring competencies in leadership, team management and strategic skills to drive personal and professional development."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/05mentalidadDeLiderCertificadoAprobacion.png",
      },
      // Platzi Courses
      // 87 - Curso de React.js Nuevo
        {
          title: {
            es: "Curso de React.js: Patrones de Render y Composición",
            en: "React.js Course: Render Patterns and Composition"
          },
          institution: {
            es: "Platzi",
            en: "Platzi"
          },
          duration: {
            es: "15 horas de teoría y práctica (Aprobado el 1 de febrero de 2025)",
            en: "15 hours of theory and practice (Approved on February 1, 2025)"
          },
          description: {
            es: "Curso enfocado en patrones avanzados de renderizado y composición en React.js. Incluye render props, children como función, compound components, control de estado compartido, abstracción de lógica reutilizable y mejores prácticas para construir componentes escalables y mantenibles.",
            en: "Course focused on advanced rendering and composition patterns in React.js. Covers render props, function as children, compound components, shared state control, reusable logic abstraction, and best practices for building scalable and maintainable components."
          },
          logo: "/images/education/platzi/platzi-logo.png",
          certificate: "/images/education/platzi/57-diploma-react-patrones-render.jpg",
          isNew: true
        },

      {
        title: {
          es: "Laboratorio de React.js: E-commerce Profesional",
          en: "React.js Lab: Professional E-commerce"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "7 horas de teoría y práctica (Aprobado el 2 de diciembre de 2023)",
          en: "7 hours of theory and practice (Approved on December 2, 2023)"
        },
        description: {
          es: "Laboratorio práctico orientado al desarrollo de un e-commerce profesional con React.js. Incluye implementación de catálogo de productos, carrito de compras, manejo de estado, componentes reutilizables, flujo de compra y buenas prácticas para aplicaciones comerciales reales.",
          en: "Hands-on lab focused on building a professional e-commerce application with React.js. Includes product catalog implementation, shopping cart, state management, reusable components, purchase flow, and best practices for real-world commercial applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/56-diploma-laboratorio-react.jpg",
        isNew: false
      },

      {
        title: {
          es: "Curso de React.js con Vite.js y TailwindCSS",
          en: "React.js with Vite.js and TailwindCSS Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas de teoría y práctica (Aprobado el 1 de diciembre de 2023)",
          en: "20 hours of theory and practice (Approved on December 1, 2023)"
        },
        description: {
          es: "Curso práctico enfocado en la construcción de aplicaciones web modernas utilizando React.js junto a Vite.js como herramienta de desarrollo y TailwindCSS para estilos. Incluye creación de componentes, manejo de estado, configuración del entorno, diseño responsive y buenas prácticas en proyectos frontend.",
          en: "Practical course focused on building modern web applications using React.js with Vite.js as the development tool and TailwindCSS for styling. Covers component creation, state management, environment setup, responsive design, and frontend best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/55-diploma-react-vite-tailwindcss.jpg",
        isNew: true
      },
      // 86 - Curso de React.js
      {
        title: {
          es: "Curso de React.js",
          en: "React.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "25 horas (Aprobado el 13 de noviembre de 2023)",
          en: "25 hours (Approved on November 13, 2023)"
        },
        description: {
          es: "Curso enfocado en el desarrollo de aplicaciones web modernas utilizando React.js. Cubre componentes funcionales, manejo de estado, hooks, ciclo de vida, enrutamiento y mejores prácticas para construir interfaces de usuario dinámicas y mantenibles.",
          en: "Course focused on developing modern web applications using React.js. It covers functional components, state management, hooks, lifecycle, routing, and best practices for building dynamic and maintainable user interfaces."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/54 diploma-react.jpg"
      },
      // 85 - Audiocurso de Frameworks y Arquitecturas Frontend
      {
        title: {
          es: "Audiocurso de Frameworks y Arquitecturas Frontend: Casos de Estudio",
          en: "Frontend Frameworks and Architectures: Case Studies Audiocourse"
        },
              institution: {
                es: "Platzi",
                en: "Platzi"
              },
              duration: {
                es: "13 horas (Aprobado el 31 de enero de 2025)",
                en: "13 hours (Approved on January 31, 2025)"
              },
              description: {
                es: "Audiocurso centrado en el análisis de frameworks y arquitecturas frontend mediante casos de estudio reales. Aborda patrones de diseño, principios de escalabilidad, rendimiento y mantenibilidad en proyectos modernos. Ideal para desarrolladores que buscan entender cómo elegir e implementar arquitecturas frontend efectivas.",
                en: "Audiocourse focused on analyzing frontend frameworks and architectures through real-world case studies. It covers design patterns, scalability principles, performance, and maintainability in modern projects. Ideal for developers aiming to understand how to select and implement effective frontend architectures."
              },
              logo: "/images/education/platzi/platzi-logo.png",
              certificate: "/images/education/platzi/53 diploma-arquitectura-frontend.jpg"
            },
            // 85 - Curso de Frameworks y Librerías de JavaScript
            {
              title: {
                es: "Curso de Frameworks y Librerías de JavaScript",
                en: "Frameworks and Libraries of JavaScript Course"
              },
              institution: {
                es: "Platzi",
                en: "Platzi"
              },
              duration: {
                es: "13 horas (Aprobado el 31 de enero de 2025)",
                en: "13 hours (Approved on January 31, 2025)"
              },
              description: {
                es: "Curso enfocado en el estudio de los principales frameworks y librerías del ecosistema JavaScript. Incluye la comprensión de su estructura, ventajas, casos de uso y diferencias clave entre ellos. Ideal para fortalecer las bases del desarrollo moderno en frontend y backend con JavaScript.",
                en: "Course focused on studying the main frameworks and libraries within the JavaScript ecosystem. It covers their structure, advantages, use cases, and key differences. Ideal for strengthening modern frontend and backend development foundations with JavaScript."
              },
              logo: "/images/education/platzi/platzi-logo.png",
              certificate: "/images/education/platzi/52 diploma-frameworks-javascript.jpg"
            },
            // 83 - Curso de Introducción al Testing con JavaScript
            {
              title: {
                es: "Curso de Introducción al Testing con JavaScript",
                en: "Introduction to Testing with JavaScript Course"
              },
              institution: {
                es: "Platzi",
                en: "Platzi"
              },
              duration: {
                es: "17 horas (Aprobado el 30 de enero de 2025)",
                en: "17 hours (Approved on January 30, 2025)"
              },
              description: {
                es: "Curso introductorio enfocado en las bases del testing aplicado a proyectos con JavaScript. Se abordan conceptos fundamentales de pruebas automatizadas, tipos de test, configuración de entornos y buenas prácticas para garantizar la calidad del código. Ideal para desarrolladores que buscan iniciar en el mundo del testing y fortalecer la confiabilidad de sus aplicaciones.",
                en: "Introductory course focused on the basics of testing in JavaScript projects. It covers fundamental concepts of automated testing, types of tests, environment setup, and best practices to ensure code quality. Ideal for developers starting in the testing world and aiming to strengthen the reliability of their applications."
              },
              logo: "/images/education/platzi/platzi-logo.png",
              certificate: "/images/education/platzi/51diploma-javascript-testing.jpg"
            },
            // 82 - Curso de Debugging con Chrome DevTools
            {
              title: {
                es: "Curso de Debugging con Chrome DevTools",
                en: "Debugging with Chrome DevTools Course"
              },
              institution: {
                es: "Platzi",
                en: "Platzi"
              },
              duration: {
                es: "18 horas (Aprobado el 31 de enero de 2025)",
                en: "18 hours (Approved on January 31, 2025)"
              },
              description: {
                es: "Curso especializado en el uso profesional de las Chrome DevTools para depurar aplicaciones web de manera eficiente. A lo largo del contenido, se abordan técnicas avanzadas de inspección de elementos, monitoreo de rendimiento, análisis de red, manejo de errores JavaScript y optimización del flujo de trabajo en tiempo real. Ideal para desarrolladores que buscan mejorar sus habilidades de diagnóstico en el navegador y aumentar la calidad de su código.",
                en: "Specialized course on the professional use of Chrome DevTools to efficiently debug web applications. The content covers advanced techniques for element inspection, performance monitoring, network analysis, JavaScript error handling, and real-time workflow optimization. Ideal for developers aiming to improve their in-browser diagnostic skills and increase code quality."
              },
              logo: "/images/education/platzi/platzi-logo.png",
              certificate: "/images/education/platzi/50cursoDeDebuggingConChromeDevTools.jpg"
            },
          // 81 - Curso Básico de Web Components con JavaScript
          {
            title: {
              es: "Curso Básico de Web Components con JavaScript",
              en: "Basic Course on Web Components with JavaScript"
            },
            institution: {
              es: "Platzi",
              en: "Platzi"
            },
            duration: {
              es: "19 horas (Aprobado el 30 de enero de 2025)",
              en: "19 hours (Approved on January 30, 2025)"
            },
            description: {
              es: "Curso básico sobre la creación de componentes web reutilizables usando JavaScript, Shadow DOM y Custom Elements, siguiendo estándares modernos.",
              en: "Basic course on creating reusable web components using JavaScript, Shadow DOM, and Custom Elements following modern standards."
            },
            logo: "/images/education/platzi/platzi-logo.png",
            certificate: "/images/education/platzi/49diplomaWebComponentsJavascript.jpg"
          },
        // 80 - Curso Profesional de Consumo de API REST con JavaScript
        {
              title: {
          es: "Curso Profesional de Consumo de API REST con JavaScript",
          en: "Professional Course on REST API Consumption with JavaScript"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 30 de enero de 2025)",
          en: "16 hours (Approved on January 30, 2025)"
        },
        description: {
          es: "Curso profesional enfocado en consumir APIs REST con JavaScript, mejorando el rendimiento y la usabilidad de las aplicaciones web mediante prácticas modernas.",
          en: "Professional course focused on consuming REST APIs with JavaScript, improving performance and usability of web applications through modern practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/48cursoDeApiRestConJavascriptPerformanceYUsabilidad.jpg"
      },
      // 79 - Práctico de Consumo de API REST con JavaScript
      {
        title: {
          es: "Práctico de Consumo de API REST con JavaScript",
          en: "Practical REST API Consumption with JavaScript"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 11 de diciembre de 2024)",
          en: "16 hours (Approved on December 11, 2024)"
        },
        description: {
          es: "Curso práctico para dominar el consumo de APIs REST con JavaScript, aplicando técnicas avanzadas para integrar servicios y datos en aplicaciones web.",
          en: "Practical course to master REST API consumption with JavaScript, applying advanced techniques to integrate services and data in web applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/46DiplomaDelCursoDeApiRestConJavascriptEjemplosConApisReales.png",
      },
      // 78 - Consumo de API REST con JavaScript
      {
        title: {
          es: "Consumo de API REST con JavaScript",
          en: "REST API Consumption with JavaScript"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 6 de diciembre de 2024)",
          en: "16 hours (Approved on December 6, 2024)"
        },
        description: {
          es: "Curso orientado a aprender cómo consumir APIs REST utilizando JavaScript para crear aplicaciones dinámicas e integradas.",
          en: "Course oriented to learn how to consume REST APIs using JavaScript to create dynamic and integrated applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/45DiplomaDelCursoDeApiRestConJavascriptFundamentos.png",
      },
      // 77 - JavaScript: Manipulación del DOM
      {
        title: {
          es: "JavaScript: Manipulación del DOM",
          en: "JavaScript: DOM Manipulation"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 29 de noviembre de 2024)",
          en: "16 hours (Approved on November 29, 2024)"
        },
        description: {
          es: "Curso enfocado en aprender a interactuar y modificar el Document Object Model (DOM) utilizando JavaScript para crear interfaces dinámicas y responsivas.",
          en: "Course focused on learning to interact and modify the Document Object Model (DOM) using JavaScript to create dynamic and responsive interfaces."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/44DiplomaDelCursoDeJavascriptManipulacinDelDom.png",
      },
      // 76 - Animaciones con CSS
      {
        title: "Animaciones con CSS",
        institution: "Platzi",
        duration: "11 horas (Aprobado el 27 de noviembre de 2024)",
        description:
          "Curso centrado en aprender a crear animaciones dinámicas y atractivas utilizando propiedades avanzadas de CSS.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/43DiplomaDelCursoDeAnimacionesConCss.png",
      },
      // 75 - Transformaciones y Transiciones en CSS
      {
        title: "Transformaciones y Transiciones en CSS",
        institution: "Platzi",
        duration: "18 horas (Aprobado el 24 de noviembre de 2024)",
        description:
          "Curso especializado en el uso de transformaciones y transiciones para crear animaciones y efectos interactivos en CSS.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/42DiplomaDelCursoDeTransformacionesYTransicionesEnCss.png",
      },
      // 74 - Curso Básico de Tailwind CSS
      {
        title: "Curso Básico de Tailwind CSS",
        institution: "Platzi",
        duration: "20 horas (Aprobado el 21 de noviembre de 2024)",
        description:
          "Curso enfocado en aprender a utilizar Tailwind CSS para crear diseños responsivos y personalizables de manera eficiente.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/41DiplomaDelCursoBsicoDeTailwind2Y3.png",
      },
      // 73 - Base de Datos con SQL
      {
        title: {
          es: "Base de Datos con SQL",
          en: "Database with SQL"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "21 horas (Aprobado el 1 de noviembre de 2024)",
          en: "21 hours (Approved on November 1, 2024)"
        },
        description: {
          es: "Participé y aprobé el curso de Base de Datos con SQL, adquiriendo habilidades en el diseño, consulta y manejo eficiente de bases de datos relacionales utilizando SQL.",
          en: "I participated and passed the Database with SQL course, acquiring skills in design, querying and efficient management of relational databases using SQL."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/27DiplomaDelCursoDeBasesDeDatosConSql.png",
      },
      // 72 - Fundamentos de JavaScript
      {
        title: {
          es: "Fundamentos de JavaScript",
          en: "JavaScript Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 1 de noviembre de 2024)",
          en: "19 hours (Approved on November 1, 2024)"
        },
        description: {
          es: "Participé y aprobé el curso Fundamentos de JavaScript, obteniendo una base sólida en el lenguaje y las mejores prácticas para el desarrollo web.",
          en: "I participated and passed the JavaScript Fundamentals course, obtaining a solid foundation in the language and best practices for web development."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/24DiplomaDelCursoDeFundamentosDeJavascript.png",
      },
      // 71 - Arquitecturas CSS
      {
        title: "Arquitecturas CSS",
        institution: "Platzi",
        duration: "16 horas (Aprobado el 29 de agosto de 2024)",
        description:
          "Curso enfocado en aprender las mejores prácticas y metodologías para estructurar CSS de forma escalable y mantenible.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/40DiplomaDelCursoDeArquitecturasCss.png",
      },
      // 70 - Diseño Web con CSS Grid y Flexbox
      {
        title: "Diseño Web con CSS Grid y Flexbox",
        institution: "Platzi",
        duration: "17 horas (Aprobado el 6 de agosto de 2024)",
        description:
          "Curso enfocado en aprender y combinar CSS Grid y Flexbox para crear diseños web responsivos y dinámicos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/39DiplomaDelCursoDeDiseoWebConCssGridYFlexbox.png",
      },
      // 69 - CSS Grid Layout (Profesional)
      {
        title: "CSS Grid Layout (Profesional)",
        institution: "Platzi",
        duration: "20 horas (Aprobado el 1 de agosto de 2024)",
        description:
          "Curso profesional para dominar el diseño de interfaces utilizando CSS Grid Layout y crear layouts avanzados.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/38DiplomaDelCursoProfesionalDeCssGridLayout.png",
      },
      // 68 - Maquetación en CSS (Práctico)
      {
        title: "Maquetación en CSS (Práctico)",
        institution: "Platzi",
        duration: "19 horas (Aprobado el 27 de julio de 2024)",
        description:
          "Curso práctico para aprender las bases de la maquetación en CSS y su aplicación en el desarrollo de interfaces web profesionales.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/37DiplomaDelCursoPrcticoDeMaquetacinEnCss.png",
      },
      // 67 - CSS Grid Básico
      {
        title: "CSS Grid Básico",
        institution: "Platzi",
        duration: "14 horas (Aprobado el 27 de julio de 2024)",
        description:
          "Curso introductorio sobre el uso de CSS Grid para diseñar layouts flexibles y modernos en aplicaciones web.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/36DiplomaDelCursoDeCssGridBsico.png",
      },
      // 66 - Sistemas de Diseño
      {
        title: "Sistemas de Diseño",
        institution: "Platzi",
        duration: "17 horas (Aprobado el 8 de julio de 2024)",
        description:
          "Curso enfocado en la creación y gestión de sistemas de diseño efectivos para proyectos escalables y consistentes.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/35DiplomaDelCursoDeSistemasDeDiseoEfectivos.png",
      },
      // 65 - Diseño para Programadores
      {
        title: "Diseño para Programadores",
        institution: "Platzi",
        duration: "14 horas (Aprobado el 4 de julio de 2024)",
        description:
          "Curso diseñado para aprender técnicas de diseño enfocadas en programadores para crear interfaces atractivas y funcionales.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/34DiplomaDelCursoDeDiseoParaDevelopers.png",
      },
      // 64 - Fundamentos de SASS: Crea tu Primera Landing Page
      {
        title: "Fundamentos de SASS: Crea tu Primera Landing Page",
        institution: "Platzi",
        duration: "26 horas (Aprobado el 2 de julio de 2024)",
        description:
          "Curso enfocado en aprender los fundamentos de SASS para el desarrollo de una landing page profesional y estilizada.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/33DiplomaDelCursoDeFundamentosDeSassCreaTuPrimeraLandingPage.png",
      },
      // 63 - Responsive Design: Maquetación Mobile First
      {
        title: "Responsive Design: Maquetación Mobile First",
        institution: "Platzi",
        duration: "25 horas (Aprobado el 26 de junio de 2024)",
        description:
          "Curso especializado en diseño web responsivo, enfocándose en la estrategia Mobile First para crear interfaces adaptables a cualquier dispositivo.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/32DiplomaDelCursoDeResponsiveDesignMaquetacinMobileFirst.png",
      },
      // 62 - Definitivo de HTML y CSS
      {
        title: "Definitivo de HTML y CSS",
        institution: "Platzi",
        duration: "23 horas (Aprobado el 10 de junio de 2024)",
        description:
          "Curso avanzado en HTML y CSS, enfocado en desarrollar habilidades para crear páginas web modernas y funcionales con diseño responsivo.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/30DiplomaDelCursoDefinitivoDeHtmlYCss.png",
      },
      // 61 - Práctico de HTML y CSS
      {
        title: "Práctico de HTML y CSS",
        institution: "Platzi",
        duration: "16 horas (Aprobado el 12 de junio de 2024)",
        description:
          "Curso práctico para desarrollar habilidades en HTML y CSS mediante proyectos aplicados y diseño web responsivo.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/31DiplomaDelCursoPrcticoDeHtmlYCss.png",
      },
      // 60 - Introducción al Desarrollo Backend
      {
        title: "Introducción al Desarrollo Backend",
        institution: "Platzi",
        duration: "14 horas (Aprobado el 12 de enero de 2024)",
        description:
          "Participé y aprobé el curso Introducción al Desarrollo Backend, adquiriendo conocimientos fundamentales sobre la creación y gestión de servidores, API y bases de datos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/26DiplomaDelCursoDeIntroduccinAlDesarrolloBackend.png",
      },
      // 59 - React.js con Vite.js y TailwindCSS
      {
        title: {
          es: "React.js con Vite.js y TailwindCSS",
          en: "React.js with Vite.js and TailwindCSS"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas (Aprobado el 1 de diciembre de 2023)",
          en: "20 hours (Approved on December 1, 2023)"
        },
        description: {
          es: "Participé y aprobé el curso React.js con Vite.js y TailwindCSS, aprendiendo a desarrollar aplicaciones web modernas y altamente eficientes utilizando estas tecnologías.",
          en: "I participated and passed the React.js with Vite.js and TailwindCSS course, learning to develop modern and highly efficient web applications using these technologies."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/25DiplomaDelCursoDeReactjsConVitejsYTailwindcss.png",
      },
      // 57 - Curso Práctico de JavaScript
      {
        title: "Curso Práctico de JavaScript",
        institution: "Platzi",
        duration: "19 horas (Aprobado el 12 de septiembre de 2023)",
        description:
          "Participé y aprobé el Curso Práctico de JavaScript, desarrollando habilidades para implementar soluciones interactivas y dinámicas en proyectos web mediante el uso avanzado del lenguaje JavaScript.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/18DiplomaDelCursoPrcticoDeJavascript.png",
      },
      // 56 - Curso de ECMAScript: Historia y Versiones de JavaScript
      {
        title: "Curso de ECMAScript: Historia y Versiones de JavaScript",
        institution: "Platzi",
        duration: "26 horas (Aprobado el 12 de septiembre de 2023)",
        description:
          "Participé y aprobé el Curso de ECMAScript: Historia y Versiones de JavaScript, aprendiendo sobre la evolución de JavaScript, sus estándares y las características clave introducidas en versiones modernas como ES6+.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/19DiplomaDelCursoDeEcmascriptHistoriaYVersionesDeJavascript.png",
      },
      // 55 - Curso Profesional de Git y GitHub
      {
        title: "Curso Profesional de Git y GitHub",
        institution: "Platzi",
        duration: "22 horas (Aprobado el 24 de enero de 2023)",
        description:
          "Participé y aprobé el curso profesional de Git y GitHub, adquiriendo habilidades avanzadas en el control de versiones, gestión de repositorios y colaboración efectiva en proyectos de desarrollo de software.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/09DiplomaGitGithub.png",
      },
      // 54 - Curso de Fundamentos de Ingeniería de Software
      {
        title: "Curso de Fundamentos de Ingeniería de Software",
        institution: "Platzi",
        duration: "16 horas (Aprobado el 8 de febrero de 2023)",
        description:
          "Participé y aprobé el curso de Fundamentos de Ingeniería de Software, adquiriendo conocimientos sobre los principios básicos de diseño, desarrollo y mantenimiento de sistemas de software eficientes y escalables.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/10DiplomaDeFundamentosDeIngenieria.png",
      },
      // 53 - Curso de Tecnología para Gerentes y Directores
      {
        title: "Curso de Tecnología para Gerentes y Directores",
        institution: "Platzi",
        duration: "15 horas (Aprobado el 4 de junio de 2023)",
        description:
          "Participé y aprobé el curso de Tecnología para Gerentes y Directores, adquiriendo conocimientos sobre la aplicación de tecnologías innovadoras en la gestión estratégica y liderazgo empresarial.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/15DiplomaDelCursoDeTecnologaParaGerentesYDirectores.png",
      },
      // 52 - Curso para Conseguir Trabajo como Frontend Developer
      {
        title: "Curso para Conseguir Trabajo como Frontend Developer",
        institution: "Platzi",
        duration: "13 horas (Aprobado el 12 de enero de 2024)",
        description:
          "Participé y aprobé el Curso para Conseguir Trabajo como Frontend Developer, adquiriendo estrategias y herramientas clave para destacar en el mercado laboral como desarrollador frontend.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/23DiplomaDelCursoParaConseguirTrabajoComoFrontendDeveloper.png",
      },
      // 51 - Curso de Introducción al Pensamiento Computacional con Python
      {
        title: "Curso de Introducción al Pensamiento Computacional con Python",
        institution: "Platzi",
        duration: "18 horas (Aprobado el 18 de mayo de 2023)",
        description:
          "Participé y aprobé el curso de Introducción al Pensamiento Computacional con Python, aprendiendo a resolver problemas complejos mediante el diseño de algoritmos y el uso del lenguaje de programación Python.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/12DiplomaDelCursoDeIntroduccinAlPensamientoComputacionalConPython.png",
      },
      // 50 - Curso de Historia de la Innovación y el Emprendimiento con Diana Uribe
      {
        title:
          "Curso de Historia de la Innovación y el Emprendimiento con Diana Uribe",
        institution: "Platzi",
        duration: "4 horas (Aprobado el 24 de mayo de 2023)",
        description:
          "Participé y aprobé el curso de Historia de la Innovación y el Emprendimiento, explorando el impacto de las grandes ideas y avances a lo largo de la historia y su influencia en el emprendimiento moderno.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/14DiplomaDelCursoDeHistoriaDeLaInnovacinYElEmprendimientoConDianaUribe.png",
      },
      // 49 - Curso de Introducción a la Web: Historia y Funcionamiento de Internet
      {
        title:
          "Curso de Introducción a la Web: Historia y Funcionamiento de Internet",
        institution: "Platzi",
        duration: "12 horas (Aprobado el 19 de mayo de 2023)",
        description:
          "Participé y aprobé el curso de Introducción a la Web: Historia y Funcionamiento de Internet, adquiriendo conocimientos sobre los orígenes, evolución y principios técnicos del funcionamiento de la web e Internet.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/13DiplomaDelCursoDeIntroduccinALaWebHistoriaYFuncionamientoDeInternet.png",
      },
      // 48 - Curso de Historia de la Programación: Lenguajes y Paradigmas
      {
        title: "Curso de Historia de la Programación: Lenguajes y Paradigmas",
        institution: "Platzi",
        duration: "14 horas (Aprobado el 26 de abril de 2023)",
        description:
          "Participé y aprobé el curso de Historia de la Programación: Lenguajes y Paradigmas, adquiriendo conocimientos sobre la evolución histórica de los lenguajes de programación y los paradigmas que han influido en el desarrollo de software.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/11DiplomaHistoriaProgramacion.png",
      },
      // 47 - Curso de Creación de Páginas Web con ChatGPT
      {
        title: "Curso de Creación de Páginas Web con ChatGPT",
        institution: "Platzi",
        duration: "9 horas (Aprobado el 1 de junio de 2023)",
        description:
          "Participé y aprobé el curso de Creación de Páginas Web con ChatGPT, aprendiendo a integrar inteligencia artificial en el desarrollo de sitios web para optimizar procesos de diseño y contenido.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/17DiplomaDelCursoDeCreacinDePginasWebConChatgpt.png",
      },
      // 46 - Curso de Creación de Páginas Web
      {
        title: "Curso de Creación de Páginas Web",
        institution: "Platzi",
        duration: "14 horas (Aprobado el 26 de mayo de 2023)",
        description:
          "Participé y aprobé el curso de Creación de Páginas Web, adquiriendo habilidades prácticas en diseño y desarrollo de sitios web utilizando tecnologías fundamentales como HTML, CSS y JavaScript.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/16DiplomaDelCursoDeCreacinDePginasWebConWordpressYNoCode.png",
      },
      // 45 - Construcción de Bases de Datos con MySQL
      // Note: This certificate is from SENA, listed separately above in the courses section
      // 44 - Curso Básico de Algoritmos y Pensamiento Lógico 2020
      {
        title: "Curso Básico de Algoritmos y Pensamiento Lógico 2020",
        institution: "Platzi",
        duration: "15 horas (Aprobado el 24 de julio de 2022)",
        description:
          "Participé y aprobé el curso básico de Algoritmos y Pensamiento Lógico, adquiriendo habilidades para resolver problemas a través del diseño y análisis de algoritmos, así como fortaleciendo mi pensamiento lógico.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/02DiplomaPensamientoLogico2020.png",
      },
      // 43 - Curso de Pensamiento Lógico: Lenguajes de Programación
      {
        title: "Curso de Pensamiento Lógico: Lenguajes de Programación",
        institution: "Platzi",
        duration: "12 horas (Aprobado el 21 de octubre de 2022)",
        description:
          "Participé y aprobé el curso de Pensamiento Lógico: Lenguajes de Programación, adquiriendo conocimientos sobre la lógica y fundamentos de diferentes lenguajes de programación, fortaleciendo mi capacidad de adaptarme a múltiples tecnologías.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/06DiplomaPensamientoLogicoLenguajes.png",
      },
      // 42 - Curso de Pensamiento Lógico: Funciones y Estructuras de Control
      {
        title:
          "Curso de Pensamiento Lógico: Funciones y Estructuras de Control",
        institution: "Platzi",
        duration: "12 horas (Aprobado el 14 de octubre de 2022)",
        description:
          "Participé y aprobé el curso de Pensamiento Lógico: Funciones y Estructuras de Control, adquiriendo conocimientos sobre el uso y diseño de funciones, así como estructuras de control en programación para resolver problemas de forma eficiente.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/05DiplomaPensamientoLogicoEstructuras.png",
      },
      // 41 - Curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo
      {
        title: "Curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo",
        institution: "Platzi",
        duration: "12 horas (Aprobado el 19 de septiembre de 2022)",
        description:
          "Participé y aprobé el curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo, adquiriendo habilidades para diseñar soluciones estructuradas mediante el uso de algoritmos y diagramas de flujo, mejorando mis capacidades de análisis y resolución de problemas.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/04DiplomaPensamientoLogico.png",
      },
      // 40 - Curso de Programación Básica
      {
        title: "Curso de Programación Básica",
        institution: "Platzi",
        duration: "29 horas (Aprobado el 17 de diciembre de 2022)",
        description:
          "Participé y aprobé el curso de Programación Básica, adquiriendo fundamentos esenciales de programación, lógica computacional y resolución de problemas mediante el uso de lenguajes de programación.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate:
          "/images/education/platzi/07NuevoDiplomaProgramacionBasica.png",
      },
      // 39 - Curso de Introducción a la Terminal y Línea de Comandos
      {
        title: "Curso de Introducción a la Terminal y Línea de Comandos",
        institution: "Platzi",
        duration: "11 horas (Aprobado el 28 de diciembre de 2022)",
        description:
          "Participé y aprobé el curso de Introducción a la Terminal y Línea de Comandos, aprendiendo a utilizar herramientas de línea de comandos de manera eficiente para la gestión y automatización de tareas en sistemas operativos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/08DiplomaTerminal.png",
      },

      // ============ OTROS CURSOS DE PLATZI ============
      // 38 - Curso de Historia de la Programación
      {
        title: "Curso de Historia de la Programación",
        institution: "Platzi",
        duration: "7 horas",
        description:
          "Curso sobre la historia y evolución de la programación y los lenguajes de programación a través del tiempo.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/11DiplomaHistoriaProgramacion.png",
      },
      // 37 - Introducción a la Web
      {
        title: "Curso de Introducción a la Web: Historia y Funcionamiento de Internet",
        institution: "Platzi",
        duration: "15 horas",
        description:
          "Aprende la historia de Internet, cómo funciona la web y los conceptos fundamentales detrás de las tecnologías que usamos a diario.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/13DiplomaDelCursoDeIntroduccinALaWebHistoriaYFuncionamientoDeInternet.png",
      },
      // 36 - Historia de la Innovación
      {
        title: "Curso de Historia de la Innovación y el Emprendimiento",
        institution: "Platzi",
        duration: "18 horas",
        description:
          "Explora la historia de la innovación y el emprendimiento con Diana Uribe, aprendiendo sobre grandes innovadores y sus contribuciones.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/14DiplomaDelCursoDeHistoriaDeLaInnovacinYElEmprendimientoConDianaUribe.png",
      },
      // 35 - Asincronismo con JavaScript
      {
        title: "Curso de Asincronismo con JavaScript",
        institution: "Platzi",
        duration: "21 horas",
        description:
          "Domina las técnicas de programación asincrónica en JavaScript: Callbacks, Promesas, Async/Await y manejo de operaciones asincrónicas.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/20DiplomaDelCursoDeAsincronismoConJavascript.png",
      },
      // 34 - NPM: Gestión de Paquetes y Dependencias
      {
        title: "Curso de NPM: Gestión de Paquetes y Dependencias en JavaScript",
        institution: "Platzi",
        duration: "12 horas",
        description:
          "Aprende a utilizar NPM para gestionar paquetes y dependencias en proyectos JavaScript, optimizando tu flujo de trabajo.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/21DiplomaDelCursoDeNpmGestinDePaquetesYDependenciasEnJavascript.png",
      },
      // 33 - Prueba Técnica: E-Commerce
      {
        title: "Prueba Técnica: E-Commerce Profesional con React.js",
        institution: "Platzi",
        duration: "20 horas",
        description:
          "Desarrolla un e-commerce profesional usando React.js en este curso práctico de prueba técnica.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/22DiplomaDePruebaTcnicaECommerceProfesionalConReactjs.png",
      },
      // 32 - Fundamentos de JavaScript (duplicado, se renumera)
      {
        title: "Curso de Fundamentos de JavaScript",
        institution: "Platzi",
        duration: "16 horas",
        description:
          "Aprende los fundamentos esenciales de JavaScript: variables, operadores, funciones, objetos, arrays y más.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/24DiplomaDelCursoDeFundamentosDeJavascript.png",
      },
      // 31 - Introducción al Desarrollo Backend
      {
        title: "Curso de Introducción al Desarrollo Backend",
        institution: "Platzi",
        duration: "15 horas",
        description:
          "Aprende los conceptos fundamentales del desarrollo backend: servidores, APIs, bases de datos y autenticación.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/26DiplomaDelCursoDeIntroduccinAlDesarrolloBackend.png",
      },
      // 30 - Bases de Datos con SQL
      {
        title: "Curso de Bases de Datos con SQL",
        institution: "Platzi",
        duration: "22 horas",
        description:
          "Domina SQL: consultas, tablas, relaciones, y optimización de bases de datos relacionales.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/27DiplomaDelCursoDeBasesDeDatosConSql.png",
      },
      // 29 - Frontend Developer
      {
        title: "Curso de Frontend Developer",
        institution: "Platzi",
        duration: "25 horas",
        description:
          "Conviértete en un desarrollador frontend completo aprendiendo HTML, CSS, JavaScript y herramientas modernas.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/28DiplomaDelCursoDeFrontendDeveloper.png",
      },
      // 28 - Práctico de Frontend Developer
      {
        title: "Curso Práctico de Frontend Developer",
        institution: "Platzi",
        duration: "20 horas",
        description:
          "Aprende practicando: construye proyectos reales como un desarrollador frontend profesional.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/29DiplomaDelCursoPrcticoDeFrontendDeveloper.png",
      },
      // 27 - HTML y CSS Definitivo
      {
        title: "Curso Definitivo de HTML y CSS",
        institution: "Platzi",
        duration: "23 horas",
        description:
          "Domina HTML y CSS desde los fundamentos hasta técnicas avanzadas para crear sitios web profesionales.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/30DiplomaDelCursoDefinitivoDeHtmlYCss.png",
      },
      // 26 - Práctico de HTML y CSS
      {
        title: "Curso Práctico de HTML y CSS",
        institution: "Platzi",
        duration: "18 horas",
        description:
          "Aprende HTML y CSS de forma práctica construyendo proyectos reales desde cero.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/31DiplomaDelCursoPrcticoDeHtmlYCss.png",
      },
      // 25 - Responsive Design
      {
        title: "Curso de Responsive Design: Maquetación Mobile First",
        institution: "Platzi",
        duration: "19 horas",
        description:
          "Aprende a crear sitios web responsivos aplicando la metodología Mobile First para adaptarse a todos los dispositivos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/32DiplomaDelCursoDeResponsiveDesignMaquetacinMobileFirst.png",
      },
      // 24 - Fundamentos de Sass
      {
        title: "Curso de Fundamentos de Sass: Crea tu Primera Landing Page",
        institution: "Platzi",
        duration: "17 horas",
        description:
          "Aprende Sass para escribir CSS más eficiente y mantenible, creando tu primera landing page profesional.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/33DiplomaDelCursoDeFundamentosDeSassCreaTuPrimeraLandingPage.png",
      },
      // 23 - Diseño para Developers
      {
        title: "Curso de Diseño para Developers",
        institution: "Platzi",
        duration: "15 horas",
        description:
          "Aprende principios de diseño esencial para desarrolladores: composición, tipografía, color y más.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/34DiplomaDelCursoDeDiseoParaDevelopers.png",
      },
      // 22 - Sistemas de Diseño Efectivos
      {
        title: "Curso de Sistemas de Diseño Efectivos",
        institution: "Platzi",
        duration: "16 horas",
        description:
          "Crea y mantén sistemas de diseño efectivos para mejorar la consistencia y eficiencia en proyectos grandes.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/35DiplomaDelCursoDeSistemasDeDiseoEfectivos.png",
      },
      // 21 - CSS Grid Básico
      {
        title: "Curso de CSS Grid Básico",
        institution: "Platzi",
        duration: "13 horas",
        description:
          "Aprende los fundamentos de CSS Grid, una herramienta poderosa para crear layouts bidimensionales complejos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/36DiplomaDelCursoDeCssGridBsico.png",
      },
      // 20 - Práctico de Maquetación en CSS
      {
        title: "Curso Práctico de Maquetación en CSS",
        institution: "Platzi",
        duration: "16 horas",
        description:
          "Practica técnicas avanzadas de maquetación en CSS construyendo layouts reales y profesionales.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/37DiplomaDelCursoPrcticoDeMaquetacinEnCss.png",
      },
      // 19 - CSS Grid Profesional
      {
        title: "Curso Profesional de CSS Grid Layout",
        institution: "Platzi",
        duration: "18 horas",
        description:
          "Domina CSS Grid a nivel profesional: crear layouts complejos, responsive y optimizados.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/38DiplomaDelCursoProfesionalDeCssGridLayout.png",
      },
      // 18 - Diseño Web con CSS Grid y Flexbox
      {
        title: "Curso de Diseño Web con CSS Grid y Flexbox",
        institution: "Platzi",
        duration: "20 horas",
        description:
          "Combina CSS Grid y Flexbox para crear diseños web modernos, flexibles y responsivos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/39DiplomaDelCursoDeDiseoWebConCssGridYFlexbox.png",
      },
      // 17 - Arquitecturas CSS
      {
        title: "Curso de Arquitecturas CSS",
        institution: "Platzi",
        duration: "14 horas",
        description:
          "Aprende arquitecturas CSS profesionales: BEM, SMACSS, Atomic Design y más para código escalable.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/40DiplomaDelCursoDeArquitecturasCss.png",
      },
      // 16 - Tailwind CSS Básico
      {
        title: "Curso Básico de Tailwind CSS 2 y 3",
        institution: "Platzi",
        duration: "12 horas",
        description:
          "Aprende Tailwind CSS desde cero: utility-first CSS framework para crear interfaces rápidamente.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/41DiplomaDelCursoBsicoDeTailwind2Y3.png",
      },
      // 15 - Transformaciones y Transiciones en CSS
      {
        title: "Curso de Transformaciones y Transiciones en CSS",
        institution: "Platzi",
        duration: "11 horas",
        description:
          "Crea animaciones y transiciones suaves con CSS para mejorar la experiencia del usuario.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/42DiplomaDelCursoDeTransformacionesYTransicionesEnCss.png",
      },
      // 14 - Animaciones con CSS
      {
        title: "Curso de Animaciones con CSS",
        institution: "Platzi",
        duration: "13 horas",
        description:
          "Domina @keyframes y animaciones CSS avanzadas para crear interfaces dinámicas y atractivas.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/43DiplomaDelCursoDeAnimacionesConCss.png",
      },
      // 13 - Manipulación del DOM con JavaScript
      {
        title: "Curso de JavaScript: Manipulación del DOM",
        institution: "Platzi",
        duration: "15 horas",
        description:
          "Aprende a manipular el DOM con JavaScript: seleccionar elementos, modificar contenido, manejar eventos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/44DiplomaDelCursoDeJavascriptManipulacinDelDom.png",
      },
      // 12 - API REST con JavaScript: Fundamentos
      {
        title: "Curso de API REST con JavaScript: Fundamentos",
        institution: "Platzi",
        duration: "14 horas",
        description:
          "Aprende los conceptos fundamentales de REST APIs y cómo consumirlas con JavaScript (Fetch, XMLHttpRequest).",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/45DiplomaDelCursoDeApiRestConJavascriptFundamentos.png",
      },
      // 11 - API REST con JavaScript: Ejemplos
      {
        title: "Curso de API REST con JavaScript: Ejemplos con APIs Reales",
        institution: "Platzi",
        duration: "16 horas",
        description:
          "Practica consumiendo APIs reales con JavaScript: Open Weather, OMDb, GitHub API y más.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/46DiplomaDelCursoDeApiRestConJavascriptEjemplosConApisReales.png",
      },
      // 10 - Básico de Algoritmos
      {
        title: "Curso Básico de Algoritmos y Pensamiento Lógico",
        institution: "Platzi",
        duration: "15 horas",
        description:
          "Aprende algoritmos fundamentales y desarrolla tu pensamiento lógico para resolver problemas de programación.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/03DiplomaBasicoProgramacion.png",
      },
      // 09 - Configuración de Entorno de Desarrollo
      {
        title: "Curso de Configuración de Entorno de Desarrollo en Windows",
        institution: "Platzi",
        duration: "12 horas",
        description:
          "Aprende a configurar tu entorno de desarrollo profesional en Windows con todas las herramientas necesarias.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/01DiplomaDelCursoDeConfiguracinDeEntornoDeDesarrolloEnWindows.png",
      },

      // Fin de cursos de Platzi

    ],
  },
  // More categories and items can be added following the same pattern
];
