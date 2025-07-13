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

      // 1
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
      // 2
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
      // 3
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
      // 4
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
      // 5
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
      // 6
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
      // 7
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
      // 8
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
      // 9
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
      // 10
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
      // 11
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
      // 12
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
      // 13
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
      // 14
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
      // 15
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
      // 16
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
      // 17
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
      // 18
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
      // 19
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
      // 20
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
      // 21
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
      // 22
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
          es: "Curso diseñado para aprender los fundamentos de React.js, creando aplicaciones web interactivas y escalables mediante componentes y manejo de estados.",
          en: "Course designed to learn the fundamentals of React.js, creating interactive and scalable web applications through components and state management."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/47DiplomaDelCursoDeReactJs.png",
      },
      // 23
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
      // 24
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
      // 25
      {
        title: "Curso Profesional de Git y GitHub",
        institution: "Platzi",
        duration: "22 horas (Aprobado el 24 de enero de 2023)",
        description:
          "Participé y aprobé el curso profesional de Git y GitHub, adquiriendo habilidades avanzadas en el control de versiones, gestión de repositorios y colaboración efectiva en proyectos de desarrollo de software.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/09DiplomaGitGithub.png",
      },
      // 26
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
      // 27
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
      // 28
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
      // 29
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
      // 30
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
      // 31
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
      // 32
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
      // 33
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
      // 34
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
      // 35
      /*   {
    "title": "Curso de Configuración de Entorno de Desarrollo en Windows",
    "institution": "Platzi",
    "duration": "12 horas (Aprobado el 9 de julio de 2023)",
    "description": "Participé y aprobé el curso de Configuración de Entorno de Desarrollo en Windows, adquiriendo conocimientos prácticos para configurar herramientas y entornos eficientes para el desarrollo de software en sistemas operativos Windows.",
    "logo": "/images/education/platzi/platzi-logo.png",
    "certificate": "/images/education/platzi/01DiplomaDelCursoDeConfiguracinDeEntornoDeDesarrolloEnWindows.png"
  }, */
      // 36
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
      // 37
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
      // 38
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
      // 39
      {
        title: "Curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo",
        institution: "Platzi",
        duration: "12 horas (Aprobado el 19 de septiembre de 2022)",
        description:
          "Participé y aprobé el curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo, adquiriendo habilidades para diseñar soluciones estructuradas mediante el uso de algoritmos y diagramas de flujo, mejorando mis capacidades de análisis y resolución de problemas.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/04DiplomaPensamientoLogico.png",
      },
      // 40
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
      // 41
      {
        title: "Curso de Introducción a la Terminal y Línea de Comandos",
        institution: "Platzi",
        duration: "11 horas (Aprobado el 28 de diciembre de 2022)",
        description:
          "Participé y aprobé el curso de Introducción a la Terminal y Línea de Comandos, aprendiendo a utilizar herramientas de línea de comandos de manera eficiente para la gestión y automatización de tareas en sistemas operativos.",
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/08DiplomaTerminal.png",
      },

      // Simplified - keeping only main courses for now
      // More courses can be added following the same pattern
      // ... other courses

    ],
  },
  // More categories and items can be added following the same pattern
];
