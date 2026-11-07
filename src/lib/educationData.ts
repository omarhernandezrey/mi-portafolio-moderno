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
      es: "Cursos en Línea (SENA) y mas...",
      en: "Online Courses (SENA) and more..."
    },
    items: [
      // 92 - Fundamentos de Git y GitHub (IBM SkillsBuild)
      {
        title: {
          es: "Fundamentos de Git y GitHub",
          en: "Git and GitHub Fundamentals"
        },
        institution: {
          es: "IBM SkillsBuild",
          en: "IBM SkillsBuild"
        },
        duration: {
          es: "5 horas (Finalizado el 13 de octubre de 2026)",
          en: "5 hours (Completed on October 13, 2026)"
        },
        description: {
          es: "Curso de IBM SkillsBuild sobre los fundamentos del control de versiones con Git y la colaboración en proyectos de software mediante GitHub.",
          en: "IBM SkillsBuild course covering version control fundamentals with Git and collaborating on software projects with GitHub."
        },
        logo: "/images/education/IBM-skillsbuild/ibm-skillsbuild-icon.png",
        certificate: "/images/education/IBM-skillsbuild/04 Fundamentos_De_Git_&_Github_IBM.png",
        isNew: true
      },
      // 91 - Fundamentos de programación (IBM SkillsBuild)
      {
        title: {
          es: "Fundamentos de programación",
          en: "Programming Fundamentals"
        },
        institution: {
          es: "IBM SkillsBuild",
          en: "IBM SkillsBuild"
        },
        duration: {
          es: "5 horas (Finalizado el 22 de septiembre de 2026)",
          en: "5 hours (Completed on September 22, 2026)"
        },
        description: {
          es: "Certificado de IBM SkillsBuild que acredita el aprendizaje de los fundamentos de la programación: lógica, variables, estructuras de control y buenas prácticas para resolver problemas mediante código.",
          en: "IBM SkillsBuild certificate accrediting foundational programming knowledge: logic, variables, control structures, and best practices for solving problems through code."
        },
        logo: "/images/education/IBM-skillsbuild/ibm-skillsbuild-icon.png",
        certificate: "/images/education/IBM-skillsbuild/03 Fundamentos de programación-IBM-skills.png",
        isNew: false
      },
      // 90 - Fundamentos de Internet (IBM SkillsBuild)
      {
        title: {
          es: "Fundamentos de Internet",
          en: "Internet Fundamentals"
        },
        institution: {
          es: "IBM SkillsBuild",
          en: "IBM SkillsBuild"
        },
        duration: {
          es: "3 horas (Finalizado el 2 de septiembre de 2026)",
          en: "3 hours (Completed on September 2, 2026)"
        },
        description: {
          es: "Certificado de IBM SkillsBuild que acredita el aprendizaje de los fundamentos de Internet: funcionamiento de la red, protocolos, navegadores y conceptos esenciales para comprender la web.",
          en: "IBM SkillsBuild certificate accrediting foundational internet knowledge: how the network works, protocols, browsers, and essential concepts for understanding the web."
        },
        logo: "/images/education/IBM-skillsbuild/ibm-skillsbuild-icon.png",
        certificate: "/images/education/IBM-skillsbuild/02 Fundamentos-de-Internet-IBM-skills.png",
        isNew: false
      },
      // 89 - Agile Explorer (IBM SkillsBuild)
      {
        title: {
          es: "Agile Explorer",
          en: "Agile Explorer"
        },
        institution: {
          es: "IBM SkillsBuild",
          en: "IBM SkillsBuild"
        },
        duration: {
          es: "Insignia digital (Aprobado el 25 de agosto de 2026)",
          en: "Digital badge (Approved on August 25, 2026)"
        },
        description: {
          es: "Insignia digital de IBM SkillsBuild que certifica el aprendizaje de los fundamentos de las metodologías ágiles: mentalidad ágil, Scrum y prácticas de colaboración para equipos de desarrollo.",
          en: "IBM SkillsBuild digital badge certifying foundational knowledge of agile methodologies: agile mindset, Scrum, and collaboration practices for development teams."
        },
        logo: "/images/education/IBM-skillsbuild/ibm-skillsbuild-icon.png",
        certificate: "/images/education/IBM-skillsbuild/01agile-explorer-certificado.jpg",
      },
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
          es: "20 horas (Finalizado el 20 de enero de 2021)",
          en: "20 hours (Completed on January 20, 2021)"
        },
        description: {
          es: "Cursé y aprobé la formación en Mentalidad de Líder, adquiriendo competencias en liderazgo, gestión de equipos y habilidades estratégicas para impulsar el desarrollo personal y profesional.",
          en: "I completed and passed the Leadership Mindset training, acquiring competencies in leadership, team management and strategic skills to drive personal and professional development."
        },
        logo: "/images/education/sena/sena-logo.png",
        certificate:
          "/images/education/sena/05mentalidadDeLiderCertificadoAprobacion.png",
      },
    ],
  },
  {
    category: {
      es: "Platzi - Ruta Frontend",
      en: "Platzi - Frontend Track"
    },
    items: [
      {
        title: {
          es: "Curso de Angular: Unit Testing para Formularios",
          en: "Angular Course: Unit Testing for Forms"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 15 de febrero de 2025)",
          en: "15 hours (Approved on February 15, 2025)"
        },
        description: {
          es: "Curso enfocado en pruebas unitarias de formularios en Angular, cubriendo técnicas de testing para validaciones, controles reactivos y componentes de formulario.",
          en: "Course focused on unit testing Angular forms, covering testing techniques for validations, reactive controls, and form components."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/01_angularUnitTestingParaFormularios.png",
      },
      {
        title: {
          es: "Curso de Computación Básica",
          en: "Basic Computing Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 27 de marzo de 2022)",
          en: "14 hours (Approved on March 27, 2022)"
        },
        description: {
          es: "Curso introductorio sobre el uso básico de computadoras: hardware, software y herramientas esenciales para iniciarse en el mundo digital.",
          en: "Introductory course on basic computer use: hardware, software, and essential tools to get started in the digital world."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/02_computacionBasica.png",
      },
      {
        title: {
          es: "Curso de Pensamiento Lógico: Algoritmos y Diagramas de Flujo",
          en: "Logical Thinking Course: Algorithms and Flowcharts"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 19 de septiembre de 2022)",
          en: "12 hours (Approved on September 19, 2022)"
        },
        description: {
          es: "Curso enfocado en el diseño de algoritmos y diagramas de flujo para resolver problemas de forma estructurada y mejorar el pensamiento lógico.",
          en: "Course focused on designing algorithms and flowcharts to solve problems in a structured way and improve logical thinking."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/03_pensamientoLogicoAlgoritmosYDiagramasDeFlujo.png",
      },
      {
        title: {
          es: "Curso de Pensamiento Lógico: Funciones y Estructuras de Control",
          en: "Logical Thinking Course: Functions and Control Structures"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 14 de octubre de 2022)",
          en: "12 hours (Approved on October 14, 2022)"
        },
        description: {
          es: "Curso sobre el uso de funciones y estructuras de control en programación para resolver problemas de manera eficiente.",
          en: "Course on using functions and control structures in programming to solve problems efficiently."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/04_pensamientoLogicoFuncionesYEstructurasDeControl.png",
      },
      {
        title: {
          es: "Curso de Pensamiento Lógico: Lenguajes de Programación",
          en: "Logical Thinking Course: Programming Languages"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 21 de octubre de 2022)",
          en: "12 hours (Approved on October 21, 2022)"
        },
        description: {
          es: "Curso centrado en los fundamentos y la lógica detrás de distintos lenguajes de programación.",
          en: "Course focused on the fundamentals and logic behind different programming languages."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/05_pensamientoLogicoLenguajesDeProgramacion.png",
      },
      {
        title: {
          es: "Curso de Fundamentos de Ingeniería de Software",
          en: "Software Engineering Fundamentals Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 8 de febrero de 2023)",
          en: "16 hours (Approved on February 8, 2023)"
        },
        description: {
          es: "Curso sobre los principios básicos de diseño, desarrollo y mantenimiento de sistemas de software eficientes y escalables.",
          en: "Course on the basic principles of designing, developing, and maintaining efficient and scalable software systems."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/06_fundamentosDeIngenieriaDeSoftware.png",
      },
      {
        title: {
          es: "Curso de Git y GitHub",
          en: "Git and GitHub Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "24 horas (Aprobado el 25 de enero de 2025)",
          en: "24 hours (Approved on January 25, 2025)"
        },
        description: {
          es: "Curso sobre control de versiones con Git y colaboración en proyectos de software mediante GitHub.",
          en: "Course on version control with Git and collaborating on software projects through GitHub."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/07_gitYGithub.png",
      },
      {
        title: {
          es: "Curso de Historia de la Programación: Lenguajes y Paradigmas",
          en: "History of Programming Course: Languages and Paradigms"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 26 de abril de 2023)",
          en: "14 hours (Approved on April 26, 2023)"
        },
        description: {
          es: "Curso sobre la evolución histórica de los lenguajes de programación y los paradigmas que han influido en el desarrollo de software.",
          en: "Course on the historical evolution of programming languages and the paradigms that have influenced software development."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/08_historiaDeLaProgramacionLenguajesYParadigmas.png",
      },
      {
        title: {
          es: "Curso de Historia de la Programación: Lenguajes y Paradigmas",
          en: "History of Programming Course: Languages and Paradigms"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 26 de abril de 2023)",
          en: "14 hours (Approved on April 26, 2023)"
        },
        description: {
          es: "Curso sobre la evolución histórica de los lenguajes de programación y los paradigmas que han influido en el desarrollo de software.",
          en: "Course on the historical evolution of programming languages and the paradigms that have influenced software development."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/09_historiaDeLaProgramacionLenguajesYParadigmas.png",
      },
      {
        title: {
          es: "Curso de Introducción a la Web: Historia y Funcionamiento de Internet",
          en: "Introduction to the Web Course: History and How the Internet Works"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 26 de enero de 2025)",
          en: "12 hours (Approved on January 26, 2025)"
        },
        description: {
          es: "Curso sobre los orígenes, evolución y principios técnicos del funcionamiento de la web e Internet.",
          en: "Course on the origins, evolution, and technical principles of how the web and the Internet work."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/10_introduccionALaWebHistoriaYFuncionamientoDeInternet.png",
      },
      {
        title: {
          es: "Curso de Historia de la Innovación y el Emprendimiento con Diana Uribe",
          en: "History of Innovation and Entrepreneurship Course with Diana Uribe"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "4 horas (Aprobado el 24 de mayo de 2023)",
          en: "4 hours (Approved on May 24, 2023)"
        },
        description: {
          es: "Curso que explora el impacto de grandes ideas y avances a lo largo de la historia y su influencia en el emprendimiento moderno.",
          en: "Course exploring the impact of great ideas and breakthroughs throughout history and their influence on modern entrepreneurship."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/11_historiaDeLaInnovacionYElEmprendimientoConDianaUribe.png",
      },
      {
        title: {
          es: "Curso de Frontend Developer",
          en: "Frontend Developer Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 13 de junio de 2023)",
          en: "15 hours (Approved on June 13, 2023)"
        },
        description: {
          es: "Curso para convertirse en desarrollador frontend completo aprendiendo HTML, CSS, JavaScript y herramientas modernas.",
          en: "Course to become a well-rounded frontend developer learning HTML, CSS, JavaScript, and modern tools."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/12_frontendDeveloper.png",
      },
      {
        title: {
          es: "Curso Práctico de Frontend Developer",
          en: "Practical Frontend Developer Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 9 de julio de 2023)",
          en: "13 hours (Approved on July 9, 2023)"
        },
        description: {
          es: "Curso práctico para aprender construyendo proyectos reales como desarrollador frontend profesional.",
          en: "Hands-on course learning by building real projects as a professional frontend developer."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/13_practicoDeFrontendDeveloper.png",
      },
      {
        title: {
          es: "Curso Definitivo de HTML y CSS",
          en: "Definitive HTML and CSS Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "23 horas (Aprobado el 10 de junio de 2024)",
          en: "23 hours (Approved on June 10, 2024)"
        },
        description: {
          es: "Curso avanzado en HTML y CSS enfocado en crear páginas web modernas, funcionales y con diseño responsivo.",
          en: "Advanced HTML and CSS course focused on creating modern, functional web pages with responsive design."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/14_definitivoDeHtmlYCss.png",
      },
      {
        title: {
          es: "Curso Práctico de HTML y CSS",
          en: "Practical HTML and CSS Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 12 de junio de 2024)",
          en: "16 hours (Approved on June 12, 2024)"
        },
        description: {
          es: "Curso práctico para desarrollar habilidades en HTML y CSS mediante proyectos aplicados.",
          en: "Hands-on course to develop HTML and CSS skills through applied projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/15_practicoDeHtmlYCss.png",
      },
      {
        title: {
          es: "Curso de Responsive Design: Maquetación Mobile First",
          en: "Responsive Design Course: Mobile First Layout"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "25 horas (Aprobado el 26 de junio de 2024)",
          en: "25 hours (Approved on June 26, 2024)"
        },
        description: {
          es: "Curso especializado en diseño web responsivo con la estrategia Mobile First para crear interfaces adaptables a cualquier dispositivo.",
          en: "Specialized course on responsive web design using the Mobile First strategy to create interfaces that adapt to any device."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/16_responsiveDesignMaquetacionMobileFirst.png",
      },
      {
        title: {
          es: "Curso de Fundamentos de Sass: Crea tu Primera Landing Page",
          en: "Sass Fundamentals Course: Build Your First Landing Page"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "26 horas (Aprobado el 2 de julio de 2024)",
          en: "26 hours (Approved on July 2, 2024)"
        },
        description: {
          es: "Curso sobre los fundamentos de Sass aplicados al desarrollo de una landing page profesional y estilizada.",
          en: "Course on Sass fundamentals applied to building a professional, styled landing page."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/17_fundamentosDeSassCreaTuPrimeraLandingPage.png",
      },
      {
        title: {
          es: "Curso de Diseño para Programadores",
          en: "Design for Programmers Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 4 de julio de 2024)",
          en: "14 hours (Approved on July 4, 2024)"
        },
        description: {
          es: "Curso de principios de diseño esencial para programadores: composición, tipografía, color y más.",
          en: "Course on essential design principles for programmers: composition, typography, color, and more."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/18_disenoParaProgramadores.png",
      },
      {
        title: {
          es: "Curso de Sistemas de Diseño",
          en: "Design Systems Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 8 de julio de 2024)",
          en: "17 hours (Approved on July 8, 2024)"
        },
        description: {
          es: "Curso sobre la creación y gestión de sistemas de diseño efectivos para proyectos escalables y consistentes.",
          en: "Course on creating and managing effective design systems for scalable, consistent projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/19_sistemasDeDiseno.png",
      },
      {
        title: {
          es: "Curso de CSS Grid Básico",
          en: "Basic CSS Grid Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 27 de julio de 2024)",
          en: "14 hours (Approved on July 27, 2024)"
        },
        description: {
          es: "Curso introductorio sobre el uso de CSS Grid para diseñar layouts flexibles y modernos.",
          en: "Introductory course on using CSS Grid to design flexible, modern layouts."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/20_cssGridBasico.png",
      },
      {
        title: {
          es: "Curso Práctico de Maquetación en CSS",
          en: "Practical CSS Layout Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 27 de julio de 2024)",
          en: "19 hours (Approved on July 27, 2024)"
        },
        description: {
          es: "Curso práctico para construir layouts reales y profesionales aplicando técnicas avanzadas de maquetación en CSS.",
          en: "Hands-on course building real, professional layouts applying advanced CSS layout techniques."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/21_practicoDeMaquetacionEnCss.png",
      },
      {
        title: {
          es: "Curso Profesional de CSS Grid Layout",
          en: "Professional CSS Grid Layout Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas (Aprobado el 1 de agosto de 2024)",
          en: "20 hours (Approved on August 1, 2024)"
        },
        description: {
          es: "Curso profesional para dominar el diseño de interfaces utilizando CSS Grid Layout y crear layouts avanzados.",
          en: "Professional course to master interface design using CSS Grid Layout and build advanced layouts."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/22_profesionalDeCssGridLayout.png",
      },
      {
        title: {
          es: "Curso de Diseño Web con CSS Grid y Flexbox",
          en: "Web Design Course with CSS Grid and Flexbox"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 6 de agosto de 2024)",
          en: "17 hours (Approved on August 6, 2024)"
        },
        description: {
          es: "Curso que combina CSS Grid y Flexbox para crear diseños web modernos, flexibles y responsivos.",
          en: "Course combining CSS Grid and Flexbox to create modern, flexible, responsive web designs."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/23_disenoWebConCssGridYFlexbox.png",
      },
      {
        title: {
          es: "Curso de Arquitecturas CSS",
          en: "CSS Architectures Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 29 de agosto de 2024)",
          en: "16 hours (Approved on August 29, 2024)"
        },
        description: {
          es: "Curso sobre mejores prácticas y metodologías para estructurar CSS de forma escalable y mantenible.",
          en: "Course on best practices and methodologies for structuring CSS in a scalable, maintainable way."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/24_arquitecturasCss.png",
      },
      {
        title: {
          es: "Curso Básico de Tailwind CSS",
          en: "Basic Tailwind CSS Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas (Aprobado el 21 de noviembre de 2024)",
          en: "20 hours (Approved on November 21, 2024)"
        },
        description: {
          es: "Curso introductorio para aprender a usar Tailwind CSS y crear diseños responsivos y personalizables de manera eficiente.",
          en: "Introductory course to learn Tailwind CSS and efficiently build responsive, customizable designs."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/25_basicoDeTailwindCss.png",
      },
      {
        title: {
          es: "Curso de Transformaciones y Transiciones en CSS",
          en: "CSS Transforms and Transitions Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 24 de noviembre de 2024)",
          en: "18 hours (Approved on November 24, 2024)"
        },
        description: {
          es: "Curso especializado en el uso de transformaciones y transiciones para crear animaciones y efectos interactivos en CSS.",
          en: "Specialized course on using transforms and transitions to create animations and interactive effects in CSS."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/26_transformacionesYTransicionesEnCss.png",
      },
      {
        title: {
          es: "Curso de Animaciones con CSS",
          en: "CSS Animations Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 27 de noviembre de 2024)",
          en: "11 hours (Approved on November 27, 2024)"
        },
        description: {
          es: "Curso centrado en aprender a crear animaciones dinámicas y atractivas utilizando propiedades avanzadas de CSS.",
          en: "Course focused on learning to create dynamic, attractive animations using advanced CSS properties."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/27_animacionesConCss.png",
      },
      {
        title: {
          es: "Curso de JavaScript: Manipulación del DOM",
          en: "JavaScript Course: DOM Manipulation"
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
          es: "Curso enfocado en aprender a interactuar y modificar el Document Object Model (DOM) con JavaScript para crear interfaces dinámicas.",
          en: "Course focused on learning to interact with and modify the Document Object Model (DOM) using JavaScript to build dynamic interfaces."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/28_javascriptManipulacionDelDom.png",
      },
      {
        title: {
          es: "Curso de Consumo de API REST con JavaScript",
          en: "REST API Consumption with JavaScript Course"
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
          en: "Course focused on learning how to consume REST APIs using JavaScript to build dynamic, integrated applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/29_consumoDeApiRestConJavascript.png",
      },
      {
        title: {
          es: "Curso Práctico de Consumo de API REST con JavaScript",
          en: "Practical REST API Consumption with JavaScript Course"
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
          es: "Curso práctico para dominar el consumo de APIs REST con JavaScript, integrando servicios y datos reales en aplicaciones web.",
          en: "Hands-on course mastering REST API consumption with JavaScript, integrating real services and data into web applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/30_practicoDeConsumoDeApiRestConJavascript.png",
      },
      {
        title: {
          es: "Curso Profesional de Consumo de API REST con JavaScript",
          en: "Professional REST API Consumption with JavaScript Course"
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
          es: "Curso profesional enfocado en consumir APIs REST con JavaScript, mejorando el rendimiento y la usabilidad de las aplicaciones web.",
          en: "Professional course focused on consuming REST APIs with JavaScript, improving performance and usability of web applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/31_profesionalDeConsumoDeApiRestConJavascript.png",
      },
      {
        title: {
          es: "Curso Básico de Web Components con JavaScript",
          en: "Basic Web Components with JavaScript Course"
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
          es: "Curso básico sobre la creación de componentes web reutilizables usando JavaScript, Shadow DOM y Custom Elements.",
          en: "Basic course on creating reusable web components using JavaScript, Shadow DOM, and Custom Elements."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/32_basicoDeWebComponentsConJavascript.png",
      },
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
          es: "Curso especializado en el uso profesional de las Chrome DevTools para depurar aplicaciones web de manera eficiente.",
          en: "Specialized course on the professional use of Chrome DevTools to efficiently debug web applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/33_debuggingConChromeDevtools.png",
      },
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
          es: "Curso introductorio enfocado en las bases del testing aplicado a proyectos con JavaScript: conceptos, tipos de test y buenas prácticas.",
          en: "Introductory course focused on the basics of testing applied to JavaScript projects: concepts, test types, and best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/34_introduccionAlTestingConJavascript.png",
      },
      {
        title: {
          es: "Curso de Frameworks y Librerías de JavaScript",
          en: "JavaScript Frameworks and Libraries Course"
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
          es: "Curso enfocado en el estudio de los principales frameworks y librerías del ecosistema JavaScript, su estructura y casos de uso.",
          en: "Course focused on studying the main frameworks and libraries of the JavaScript ecosystem, their structure, and use cases."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/35_frameworksYLibreriasDeJavascript.png",
      },
      {
        title: {
          es: "Audiocurso de Frameworks y Arquitecturas Frontend: Casos de Estudio",
          en: "Frontend Frameworks and Architectures Audiocourse: Case Studies"
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
          es: "Audiocurso centrado en el análisis de frameworks y arquitecturas frontend mediante casos de estudio reales, patrones de diseño y escalabilidad.",
          en: "Audiocourse focused on analyzing frontend frameworks and architectures through real case studies, design patterns, and scalability."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/36_audiocursoFrameworksYArquitecturasFrontendCasosDeEstudio.png",
      },
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
          es: "Curso enfocado en el desarrollo de aplicaciones web modernas con React.js: componentes funcionales, hooks, ciclo de vida y enrutamiento.",
          en: "Course focused on building modern web applications with React.js: functional components, hooks, lifecycle, and routing."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/37_reactJs.png",
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
          es: "20 horas (Aprobado el 1 de diciembre de 2023)",
          en: "20 hours (Approved on December 1, 2023)"
        },
        description: {
          es: "Curso práctico sobre construir aplicaciones web modernas con React.js, Vite.js como entorno de desarrollo y TailwindCSS para estilos.",
          en: "Hands-on course on building modern web applications with React.js, Vite.js as the dev environment, and TailwindCSS for styling."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/38_reactJsConViteJsYTailwindCss.png",
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
          es: "7 horas (Aprobado el 2 de diciembre de 2023)",
          en: "7 hours (Approved on December 2, 2023)"
        },
        description: {
          es: "Laboratorio práctico de un e-commerce profesional con React.js: catálogo de productos, carrito de compras y flujo de compra.",
          en: "Hands-on lab building a professional e-commerce with React.js: product catalog, shopping cart, and checkout flow."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/39_laboratorioReactJsEcommerceProfesional.png",
      },
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
          es: "15 horas (Aprobado el 1 de febrero de 2025)",
          en: "15 hours (Approved on February 1, 2025)"
        },
        description: {
          es: "Curso sobre patrones avanzados de renderizado y composición en React.js: render props, children como función y compound components.",
          en: "Course on advanced rendering and composition patterns in React.js: render props, function as children, and compound components."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/40_reactJsPatronesDeRenderYComposicion.png",
      },
      {
        title: {
          es: "Curso de React.js: Manejo Profesional del Estado",
          en: "React.js Course: Professional State Management"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 1 de febrero de 2025)",
          en: "16 hours (Approved on February 1, 2025)"
        },
        description: {
          es: "Curso sobre el manejo profesional del estado en React.js: useReducer, useContext y composición de estado global.",
          en: "Course on professional state management in React.js: useReducer, useContext, and global state composition."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/41_reactJsManejoProfesionalDelEstado.png",
      },
      {
        title: {
          es: "Curso de React.js: Navegación con React Router",
          en: "React.js Course: Navigation with React Router"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 1 de febrero de 2025)",
          en: "15 hours (Approved on February 1, 2025)"
        },
        description: {
          es: "Curso sobre enrutamiento y navegación en aplicaciones React.js utilizando React Router.",
          en: "Course on routing and navigation in React.js applications using React Router."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/42_reactJsNavegacionConReactRouter.png",
      },
      {
        title: {
          es: "Curso de State Machines en React.js",
          en: "State Machines in React.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 2 de febrero de 2025)",
          en: "10 hours (Approved on February 2, 2025)"
        },
        description: {
          es: "Curso sobre el uso de máquinas de estado (state machines) para modelar lógica compleja en aplicaciones React.js.",
          en: "Course on using state machines to model complex logic in React.js applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/43_stateMachinesEnReactJs.png",
      },
      {
        title: {
          es: "Curso Profesional de React.js y Redux",
          en: "Professional React.js and Redux Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "21 horas (Aprobado el 2 de febrero de 2025)",
          en: "21 hours (Approved on February 2, 2025)"
        },
        description: {
          es: "Curso profesional sobre gestión de estado global en aplicaciones React.js utilizando Redux.",
          en: "Professional course on global state management in React.js applications using Redux."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/44_profesionalDeReactJsYRedux.png",
      },
      {
        title: {
          es: "Curso de React.js con TypeScript",
          en: "React.js with TypeScript Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 2 de febrero de 2025)",
          en: "12 hours (Approved on February 2, 2025)"
        },
        description: {
          es: "Curso sobre el uso de TypeScript en aplicaciones React.js para un tipado estático seguro y escalable.",
          en: "Course on using TypeScript in React.js applications for safe, scalable static typing."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/45_reactJsConTypescript.png",
      },
      {
        title: {
          es: "Curso de Server Side Render con React.js",
          en: "Server Side Rendering with React.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "9 horas (Aprobado el 2 de febrero de 2025)",
          en: "9 hours (Approved on February 2, 2025)"
        },
        description: {
          es: "Curso sobre renderizado del lado del servidor (SSR) en aplicaciones React.js.",
          en: "Course on server-side rendering (SSR) in React.js applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/46_serverSideRenderConReactJs.png",
      },
      {
        title: {
          es: "Curso de React.js Avanzado",
          en: "Advanced React.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 2 de febrero de 2025)",
          en: "16 hours (Approved on February 2, 2025)"
        },
        description: {
          es: "Curso avanzado sobre React.js con técnicas y patrones de nivel profesional para aplicaciones complejas.",
          en: "Advanced React.js course covering professional-level techniques and patterns for complex applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/47_reactJsAvanzado.png",
      },
      {
        title: {
          es: "Curso de Next.js Avanzado",
          en: "Advanced Next.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 4 de febrero de 2025)",
          en: "15 hours (Approved on February 4, 2025)"
        },
        description: {
          es: "Curso avanzado sobre Next.js: renderizado híbrido, rutas, optimización y características de nivel profesional.",
          en: "Advanced Next.js course: hybrid rendering, routing, optimization, and professional-level features."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/48_nextJsAvanzado.png",
      },
      {
        title: {
          es: "Curso de React Testing Library",
          en: "React Testing Library Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 4 de febrero de 2025)",
          en: "16 hours (Approved on February 4, 2025)"
        },
        description: {
          es: "Curso sobre pruebas de componentes React con React Testing Library, enfocado en testear desde la perspectiva del usuario.",
          en: "Course on testing React components with React Testing Library, focused on testing from the user's perspective."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/49_reactTestingLibrary.png",
      },
      {
        title: {
          es: "Curso de Vue.js: Introducción y Fundamentos",
          en: "Vue.js Course: Introduction and Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "22 horas (Aprobado el 5 de febrero de 2025)",
          en: "22 hours (Approved on February 5, 2025)"
        },
        description: {
          es: "Curso introductorio a Vue.js: fundamentos del framework, directivas, data binding y estructura de proyectos.",
          en: "Introductory course to Vue.js: framework fundamentals, directives, data binding, and project structure."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/50_vueJsIntroduccionYFundamentos.png",
      },
      {
        title: {
          es: "Curso de Vue.js: Componentes y Composition API",
          en: "Vue.js Course: Components and Composition API"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 6 de febrero de 2025)",
          en: "13 hours (Approved on February 6, 2025)"
        },
        description: {
          es: "Curso sobre la creación de componentes en Vue.js y el uso de la Composition API.",
          en: "Course on building components in Vue.js and using the Composition API."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/51_vueJsComponentesYCompositionApi.png",
      },
      {
        title: {
          es: "Curso Práctico de Vue.js",
          en: "Practical Vue.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 6 de febrero de 2025)",
          en: "16 hours (Approved on February 6, 2025)"
        },
        description: {
          es: "Curso práctico para reforzar los fundamentos de Vue.js construyendo proyectos reales.",
          en: "Hands-on course reinforcing Vue.js fundamentals by building real projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/52_practicoDeVueJs.png",
      },
      {
        title: {
          es: "Curso de Vue.js: Navegación con Vue Router",
          en: "Vue.js Course: Navigation with Vue Router"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 6 de febrero de 2025)",
          en: "12 hours (Approved on February 6, 2025)"
        },
        description: {
          es: "Curso sobre enrutamiento y navegación en aplicaciones Vue.js utilizando Vue Router.",
          en: "Course on routing and navigation in Vue.js applications using Vue Router."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/53_vueJsNavegacionConVueRouter.png",
      },
      {
        title: {
          es: "Curso de Vue.js: Manejo de Estado con Vuex",
          en: "Vue.js Course: State Management with Vuex"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 6 de febrero de 2025)",
          en: "14 hours (Approved on February 6, 2025)"
        },
        description: {
          es: "Curso sobre la gestión de estado centralizado en aplicaciones Vue.js utilizando Vuex.",
          en: "Course on centralized state management in Vue.js applications using Vuex."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/54_vueJsManejoDeEstadoConVuex.png",
      },
      {
        title: {
          es: "Curso de Vue.js: Manejo del Estado con Pinia",
          en: "Vue.js Course: State Management with Pinia"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "7 horas (Aprobado el 7 de febrero de 2025)",
          en: "7 hours (Approved on February 7, 2025)"
        },
        description: {
          es: "Curso sobre el manejo de estado en aplicaciones Vue.js utilizando Pinia, la librería moderna de gestión de estado.",
          en: "Course on state management in Vue.js applications using Pinia, the modern state management library."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/55_vueJsManejoDelEstadoConPinia.png",
      },
      {
        title: {
          es: "Curso de Unit Testing en Vue.js",
          en: "Unit Testing in Vue.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 7 de febrero de 2025)",
          en: "11 hours (Approved on February 7, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias en aplicaciones Vue.js: configuración de entorno y testing de componentes.",
          en: "Course on unit testing in Vue.js applications: environment setup and component testing."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/56_unitTestingEnVueJs.png",
      },
      {
        title: {
          es: "Curso de Reactividad con Vue.js 3",
          en: "Reactivity with Vue.js 3 Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 7 de febrero de 2025)",
          en: "16 hours (Approved on February 7, 2025)"
        },
        description: {
          es: "Curso sobre el sistema de reactividad de Vue.js 3: refs, reactive y el funcionamiento interno del framework.",
          en: "Course on Vue.js 3's reactivity system: refs, reactive, and the framework's internal workings."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/57_reactividadConVueJs3.png",
      },
      {
        title: {
          es: "Curso Básico de Vue.js 2",
          en: "Basic Vue.js 2 Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 9 de febrero de 2025)",
          en: "19 hours (Approved on February 9, 2025)"
        },
        description: {
          es: "Curso introductorio a Vue.js 2: fundamentos del framework, directivas y estructura básica de proyectos.",
          en: "Introductory course to Vue.js 2: framework fundamentals, directives, and basic project structure."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/58_basicoDeVueJs2.png",
      },
      {
        title: {
          es: "Curso Profesional de Vue.js 2",
          en: "Professional Vue.js 2 Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "35 horas (Aprobado el 9 de febrero de 2025)",
          en: "35 hours (Approved on February 9, 2025)"
        },
        description: {
          es: "Curso profesional de Vue.js 2 para profundizar en componentes, estado y buenas prácticas de nivel avanzado.",
          en: "Professional Vue.js 2 course to go deeper into components, state, and advanced best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/59_profesionalDeVueJs2.png",
      },
      {
        title: {
          es: "Curso Avanzado de Vue.js 2",
          en: "Advanced Vue.js 2 Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 10 de febrero de 2025)",
          en: "12 hours (Approved on February 10, 2025)"
        },
        description: {
          es: "Curso avanzado de Vue.js 2 con técnicas y patrones de nivel profesional para aplicaciones complejas.",
          en: "Advanced Vue.js 2 course covering professional-level techniques and patterns for complex applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/60_avanzadoDeVueJs2.png",
      },
      {
        title: {
          es: "Curso de Testing con Vue.js",
          en: "Testing with Vue.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 10 de febrero de 2025)",
          en: "11 hours (Approved on February 10, 2025)"
        },
        description: {
          es: "Curso sobre pruebas automatizadas en aplicaciones Vue.js, configuración de entorno y testing de componentes.",
          en: "Course on automated testing in Vue.js applications, environment setup, and component testing."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/61_testingConVueJs2.png",
      },
      {
        title: {
          es: "Curso de Nuxt 2",
          en: "Nuxt 2 Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 11 de febrero de 2025)",
          en: "14 hours (Approved on February 11, 2025)"
        },
        description: {
          es: "Curso sobre Nuxt 2, el framework basado en Vue.js para aplicaciones universales con renderizado del lado del servidor.",
          en: "Course on Nuxt 2, the Vue.js-based framework for universal applications with server-side rendering."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/62_nuxt2.png",
      },
      {
        title: {
          es: "Curso de Single Page Applications en Laravel con Inertia y Vue.js",
          en: "Single Page Applications in Laravel with Inertia and Vue.js Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "8 horas (Aprobado el 12 de febrero de 2025)",
          en: "8 hours (Approved on February 12, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de SPAs integrando Laravel con Inertia.js y Vue.js, sin necesidad de una API REST tradicional.",
          en: "Course on building SPAs by integrating Laravel with Inertia.js and Vue.js, without the need for a traditional REST API."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/63_singlePageApplicationsEnLaravelConInertiaYVueJs.png",
      },
      {
        title: {
          es: "Curso de Angular 17: Creación de Aplicaciones Web",
          en: "Angular 17 Course: Building Web Applications"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "27 horas (Aprobado el 12 de febrero de 2025)",
          en: "27 hours (Approved on February 12, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de aplicaciones web modernas con Angular 17: componentes, servicios y arquitectura del framework.",
          en: "Course on building modern web applications with Angular 17: components, services, and framework architecture."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/64_angular17CreacionDeAplicacionesWeb.png",
      },
      {
        title: {
          es: "Prueba Técnica: Desarrollo Frontend con Angular",
          en: "Technical Test: Frontend Development with Angular"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "5 horas (Aprobado el 13 de febrero de 2025)",
          en: "5 hours (Approved on February 13, 2025)"
        },
        description: {
          es: "Prueba técnica práctica orientada a evaluar habilidades de desarrollo frontend utilizando Angular.",
          en: "Hands-on technical test aimed at evaluating frontend development skills using Angular."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/65_pruebaTecnicaDesarrolloFrontendConAngular.png",
      },
      {
        title: {
          es: "Curso de Maquetación con Angular CDK y TailwindCSS",
          en: "Layout Course with Angular CDK and TailwindCSS"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 13 de febrero de 2025)",
          en: "19 hours (Approved on February 13, 2025)"
        },
        description: {
          es: "Curso sobre maquetación de interfaces en Angular combinando el Component Dev Kit (CDK) con TailwindCSS.",
          en: "Course on building Angular interfaces combining the Component Dev Kit (CDK) with TailwindCSS."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/66_maquetacionConAngularCdkYTailwindCss.png",
      },
      {
        title: {
          es: "Curso de Autenticación con Angular",
          en: "Authentication with Angular Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 13 de febrero de 2025)",
          en: "12 hours (Approved on February 13, 2025)"
        },
        description: {
          es: "Curso sobre la implementación de autenticación y manejo de sesiones seguras en aplicaciones Angular.",
          en: "Course on implementing authentication and secure session handling in Angular applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/67_autenticacionConAngular.png",
      },
      {
        title: {
          es: "Curso Práctico de Angular: Clon de Trello",
          en: "Practical Angular Course: Trello Clone"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas (Aprobado el 13 de febrero de 2025)",
          en: "20 hours (Approved on February 13, 2025)"
        },
        description: {
          es: "Curso práctico orientado a construir un clon de Trello con Angular, aplicando conceptos reales de desarrollo frontend.",
          en: "Hands-on course focused on building a Trello clone with Angular, applying real-world frontend development concepts."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/68_practicoDeAngularClonDeTrello.png",
      },
      {
        title: {
          es: "Laboratorio Profesional de Angular: Optimización Web con Lighthouse y SSR",
          en: "Professional Angular Lab: Web Optimization with Lighthouse and SSR"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "5 horas (Aprobado el 14 de febrero de 2025)",
          en: "5 hours (Approved on February 14, 2025)"
        },
        description: {
          es: "Laboratorio profesional sobre optimización de aplicaciones Angular utilizando Lighthouse y renderizado del lado del servidor (SSR).",
          en: "Professional lab on optimizing Angular applications using Lighthouse and server-side rendering (SSR)."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/69_laboratorioDeAngularOptimizacionWebConLighthouseYSsr.png",
      },
      {
        title: {
          es: "Curso de Angular: Unit Testing para Servicios",
          en: "Angular Course: Unit Testing for Services"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 14 de febrero de 2025)",
          en: "19 hours (Approved on February 14, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias de servicios en Angular, cubriendo mocking de dependencias e inyección de dependencias en tests.",
          en: "Course on unit testing Angular services, covering dependency mocking and dependency injection in tests."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/70_angularUnitTestingParaServicios.png",
      },
      {
        title: {
          es: "Curso de Angular: Unit Testing para Componentes",
          en: "Angular Course: Unit Testing for Components"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 14 de febrero de 2025)",
          en: "16 hours (Approved on February 14, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias de componentes en Angular, utilizando TestBed y técnicas de testing aisladas.",
          en: "Course on unit testing Angular components, using TestBed and isolated testing techniques."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/71_angularUnitTestingParaComponentes.png",
      },
      {
        title: {
          es: "Curso de Angular: Unit Testing para Formularios",
          en: "Angular Course: Unit Testing for Forms"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 15 de febrero de 2025)",
          en: "15 hours (Approved on February 15, 2025)"
        },
        description: {
          es: "Curso enfocado en pruebas unitarias de formularios en Angular, cubriendo técnicas de testing para validaciones, controles reactivos y componentes de formulario.",
          en: "Course focused on unit testing Angular forms, covering testing techniques for validations, reactive controls, and form components."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/72_angularUnitTestingParaFormularios.png",
      },
      {
        title: {
          es: "Curso de Angular: Unit Testing Routing",
          en: "Angular Course: Unit Testing Routing"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 15 de febrero de 2025)",
          en: "13 hours (Approved on February 15, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias del sistema de enrutamiento en aplicaciones Angular.",
          en: "Course on unit testing the routing system in Angular applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/frontend/73_angularUnitTestingRouting.png",
      },
    ],
  },
  {
    category: {
      es: "Platzi - Ruta Backend",
      en: "Platzi - Backend Track"
    },
    items: [
      {
        title: {
          es: "Introducción al Desarrollo Backend",
          en: "Introduction to Backend Development"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 12 de enero de 2024)",
          en: "14 hours (Approved on January 12, 2024)"
        },
        description: {
          es: "Curso introductorio a los fundamentos del desarrollo backend: servidores, APIs, bases de datos y autenticación.",
          en: "Introductory course covering backend development fundamentals: servers, APIs, databases, and authentication."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/01_introduccionAlDesarrolloBackend.png",
      },
      {
        title: {
          es: "Fundamentos de Bases de Datos",
          en: "Database Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "26 horas (Aprobado el 18 de febrero de 2025)",
          en: "26 hours (Approved on February 18, 2025)"
        },
        description: {
          es: "Curso centrado en los conceptos esenciales de las bases de datos: modelos, tipos y principios de diseño relacional y no relacional.",
          en: "Course focused on essential database concepts: models, types, and relational and non-relational design principles."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/02_fundamentosDeBasesDeDatos.png",
      },
      {
        title: {
          es: "SQL y MySQL",
          en: "SQL and MySQL"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 17 de febrero de 2025)",
          en: "18 hours (Approved on February 17, 2025)"
        },
        description: {
          es: "Curso práctico sobre el lenguaje SQL aplicado a MySQL, cubriendo consultas, tablas y relaciones entre datos.",
          en: "Practical course on the SQL language applied to MySQL, covering queries, tables, and data relationships."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/03_sqlYMysql.png",
      },
      {
        title: {
          es: "MySQL y MariaDB",
          en: "MySQL and MariaDB"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "25 horas (Aprobado el 19 de febrero de 2025)",
          en: "25 hours (Approved on February 19, 2025)"
        },
        description: {
          es: "Curso enfocado en la administración y consulta de bases de datos relacionales utilizando MySQL y MariaDB.",
          en: "Course focused on administering and querying relational databases using MySQL and MariaDB."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/04_mysqlYMariadb.png",
      },
      {
        title: {
          es: "PostgreSQL",
          en: "PostgreSQL"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 20 de febrero de 2025)",
          en: "15 hours (Approved on February 20, 2025)"
        },
        description: {
          es: "Curso sobre el motor de bases de datos PostgreSQL: instalación, consultas, tipos de datos avanzados y buenas prácticas.",
          en: "Course on the PostgreSQL database engine: installation, queries, advanced data types, and best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/05_postgresql.png",
      },
      {
        title: {
          es: "Curso Práctico de SQL",
          en: "Practical SQL Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 22 de febrero de 2025)",
          en: "11 hours (Approved on February 22, 2025)"
        },
        description: {
          es: "Curso práctico para reforzar el uso de SQL mediante ejercicios aplicados de consulta y manipulación de datos.",
          en: "Practical course reinforcing SQL usage through applied data querying and manipulation exercises."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/06_practicoDeSql.png",
      },
      {
        title: {
          es: "Optimización de Bases de Datos en SQL Server",
          en: "SQL Server Database Optimization"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 22 de febrero de 2025)",
          en: "17 hours (Approved on February 22, 2025)"
        },
        description: {
          es: "Curso enfocado en técnicas de optimización de rendimiento para bases de datos en SQL Server.",
          en: "Course focused on performance optimization techniques for SQL Server databases."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/07_optimizacionDeBasesDeDatosEnSqlServer.png",
      },
      {
        title: {
          es: "Bases de Datos NoSQL",
          en: "NoSQL Databases"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 22 de febrero de 2025)",
          en: "10 hours (Approved on February 22, 2025)"
        },
        description: {
          es: "Curso introductorio a las bases de datos NoSQL: modelos documentales, clave-valor y casos de uso frente a las bases relacionales.",
          en: "Introductory course on NoSQL databases: document-based and key-value models, and use cases versus relational databases."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/08_baseDeDatosNosql.png",
      },
      {
        title: {
          es: "Introducción a MongoDB",
          en: "Introduction to MongoDB"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 23 de febrero de 2025)",
          en: "13 hours (Approved on February 23, 2025)"
        },
        description: {
          es: "Curso introductorio a MongoDB: instalación, colecciones, documentos y operaciones CRUD básicas.",
          en: "Introductory course on MongoDB: installation, collections, documents, and basic CRUD operations."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/09_introduccionAMongodb.png",
      },
      {
        title: {
          es: "Modelamiento de Datos con MongoDB",
          en: "Data Modeling with MongoDB"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 23 de febrero de 2025)",
          en: "16 hours (Approved on February 23, 2025)"
        },
        description: {
          es: "Curso sobre estrategias de modelamiento de datos orientado a documentos en MongoDB para aplicaciones escalables.",
          en: "Course on document-oriented data modeling strategies in MongoDB for scalable applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/10_modelamientoDeDatosConMongodb.png",
      },
      {
        title: {
          es: "Expresiones Regulares",
          en: "Regular Expressions"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 23 de febrero de 2025)",
          en: "15 hours (Approved on February 23, 2025)"
        },
        description: {
          es: "Curso sobre el uso de expresiones regulares para búsqueda, validación y manipulación de texto en proyectos de software.",
          en: "Course on using regular expressions for text search, validation, and manipulation in software projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/11_expresionesRegulares.png",
      },
      {
        title: {
          es: "MongoDB Aggregation Framework",
          en: "MongoDB Aggregation Framework"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 24 de febrero de 2025)",
          en: "15 hours (Approved on February 24, 2025)"
        },
        description: {
          es: "Curso centrado en el framework de agregación de MongoDB para procesar y transformar datos mediante pipelines.",
          en: "Course focused on MongoDB's aggregation framework for processing and transforming data through pipelines."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/12_mongodbAggregationFramework.png",
      },
      {
        title: {
          es: "Fundamentos de Arquitectura de Software",
          en: "Software Architecture Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 25 de febrero de 2025)",
          en: "12 hours (Approved on February 25, 2025)"
        },
        description: {
          es: "Curso introductorio a los principios de arquitectura de software: capas, componentes y decisiones de diseño.",
          en: "Introductory course on software architecture principles: layers, components, and design decisions."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/13_fundamentosDeArquitecturaDeSoftware.png",
      },
      {
        title: {
          es: "Curso Profesional de Arquitectura de Software",
          en: "Professional Software Architecture Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 24 de febrero de 2025)",
          en: "14 hours (Approved on February 24, 2025)"
        },
        description: {
          es: "Curso avanzado sobre patrones y estilos de arquitectura de software para sistemas escalables y mantenibles.",
          en: "Advanced course on software architecture patterns and styles for scalable, maintainable systems."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/14_profesionalDeArquitecturaDeSoftware.png",
      },
      {
        title: {
          es: "Arquitecturas Limpias para Desarrollo de Software",
          en: "Clean Architectures for Software Development"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 25 de febrero de 2025)",
          en: "15 hours (Approved on February 25, 2025)"
        },
        description: {
          es: "Curso sobre Clean Architecture: separación de responsabilidades, independencia de frameworks y testabilidad.",
          en: "Course on Clean Architecture: separation of concerns, framework independence, and testability."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/15_arquitecturasLimpiasParaDesarrolloDeSoftware.png",
      },
      {
        title: {
          es: "Curso Práctico de Arquitectura Backend",
          en: "Practical Backend Architecture Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 25 de febrero de 2025)",
          en: "14 hours (Approved on February 25, 2025)"
        },
        description: {
          es: "Curso práctico para aplicar principios de arquitectura backend en un proyecto real, de forma escalable y mantenible.",
          en: "Practical course applying backend architecture principles to a real project in a scalable, maintainable way."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/16_practicoDeArquitecturaBackend.png",
      },
      {
        title: {
          es: "Audiocurso de Fundamentos de Arquitectura de Alta Concurrencia",
          en: "Audio Course: High-Concurrency Architecture Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 25 de febrero de 2025)",
          en: "15 hours (Approved on February 25, 2025)"
        },
        description: {
          es: "Audiocurso sobre los fundamentos de arquitecturas de alta concurrencia: escalabilidad, colas y procesamiento distribuido.",
          en: "Audio course on high-concurrency architecture fundamentals: scalability, queues, and distributed processing."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/17_audiocursoFundamentosDeArquitecturaDeAltaConcurrencia.png",
      },
      {
        title: {
          es: "Introducción a los Patrones de Diseño de Software",
          en: "Introduction to Software Design Patterns"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 26 de febrero de 2025)",
          en: "14 hours (Approved on February 26, 2025)"
        },
        description: {
          es: "Curso introductorio a los patrones de diseño de software más utilizados para resolver problemas comunes de forma reutilizable.",
          en: "Introductory course on the most widely used software design patterns for solving common problems in a reusable way."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/18_introduccionALosPatronesDeDisenoDeSoftware.png",
      },
      {
        title: {
          es: "Desarrollo de API REST: Estándares y Buenas Prácticas",
          en: "REST API Development: Standards and Best Practices"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 26 de febrero de 2025)",
          en: "18 hours (Approved on February 26, 2025)"
        },
        description: {
          es: "Curso sobre el diseño de APIs REST siguiendo estándares de la industria y buenas prácticas de documentación y versionado.",
          en: "Course on designing REST APIs following industry standards and best practices for documentation and versioning."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/19_desarrolloDeApiRestEstandaresYBuenasPracticas.png",
      },
      {
        title: {
          es: "Docker Avanzado",
          en: "Advanced Docker"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 27 de febrero de 2025)",
          en: "18 hours (Approved on February 27, 2025)"
        },
        description: {
          es: "Curso avanzado de Docker: orquestación de contenedores, redes, volúmenes y optimización de imágenes para producción.",
          en: "Advanced Docker course: container orchestration, networking, volumes, and image optimization for production."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/20_dockerAvanzado.png",
      },
      {
        title: {
          es: "ECMAScript: Historia y Versiones de JavaScript",
          en: "ECMAScript: JavaScript History and Versions"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "26 horas (Aprobado el 12 de septiembre de 2023)",
          en: "26 hours (Approved on September 12, 2023)"
        },
        description: {
          es: "Curso sobre la evolución de JavaScript a través de ECMAScript, sus estándares y características clave introducidas en versiones modernas como ES6+.",
          en: "Course on the evolution of JavaScript through ECMAScript, its standards, and key features introduced in modern versions like ES6+."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/21_ecmascriptHistoriaYVersionesDeJavascript.png",
      },
      {
        title: {
          es: "Fundamentos de Node.js",
          en: "Node.js Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 27 de febrero de 2025)",
          en: "17 hours (Approved on February 27, 2025)"
        },
        description: {
          es: "Curso introductorio a Node.js: entorno de ejecución, módulos, sistema de archivos y creación de servidores básicos.",
          en: "Introductory course on Node.js: runtime environment, modules, file system, and building basic servers."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/22_fundamentosDeNodeJs.png",
      },
      {
        title: {
          es: "Backend con Node.js: API REST con Express.js",
          en: "Backend with Node.js: REST API with Express.js"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 27 de febrero de 2025)",
          en: "15 hours (Approved on February 27, 2025)"
        },
        description: {
          es: "Curso práctico para construir APIs REST con Node.js y Express.js, cubriendo rutas, middlewares y manejo de errores.",
          en: "Practical course for building REST APIs with Node.js and Express.js, covering routes, middlewares, and error handling."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/23_backendConNodeJsApiRestConExpressJs.png",
      },
      {
        title: {
          es: "Backend con Node.js: Bases de Datos con PostgreSQL",
          en: "Backend with Node.js: Databases with PostgreSQL"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "21 horas (Aprobado el 28 de febrero de 2025)",
          en: "21 hours (Approved on February 28, 2025)"
        },
        description: {
          es: "Curso sobre la integración de Node.js con PostgreSQL para persistir y consultar datos en aplicaciones backend.",
          en: "Course on integrating Node.js with PostgreSQL to persist and query data in backend applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/24_backendConNodeJsBasesDeDatosConPostgresql.png",
      },
      {
        title: {
          es: "Backend con Node.js: Autenticación con Passport.js y JWT",
          en: "Backend with Node.js: Authentication with Passport.js and JWT"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 28 de febrero de 2025)",
          en: "17 hours (Approved on February 28, 2025)"
        },
        description: {
          es: "Curso sobre implementación de autenticación segura en Node.js utilizando Passport.js y tokens JWT.",
          en: "Course on implementing secure authentication in Node.js using Passport.js and JWT tokens."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/25_backendConNodeJsAutenticacionConPassportJsYJwt.png",
      },
      {
        title: {
          es: "Node.js: Autenticación, Microservicios y Redis",
          en: "Node.js: Authentication, Microservices and Redis"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "21 horas (Aprobado el 3 de marzo de 2025)",
          en: "21 hours (Approved on March 3, 2025)"
        },
        description: {
          es: "Curso sobre arquitecturas de microservicios en Node.js, con autenticación distribuida y caché mediante Redis.",
          en: "Course on microservice architectures in Node.js, with distributed authentication and caching using Redis."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/26_nodeJsAutenticacionMicroserviciosYRedis.png",
      },
      {
        title: {
          es: "OAuth 2.0 y OpenID Connect: Flujos de Autenticación y Casos de Estudio",
          en: "OAuth 2.0 and OpenID Connect: Authentication Flows and Case Studies"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 3 de marzo de 2025)",
          en: "13 hours (Approved on March 3, 2025)"
        },
        description: {
          es: "Curso sobre los protocolos OAuth 2.0 y OpenID Connect, sus flujos de autenticación y aplicación mediante casos de estudio reales.",
          en: "Course on the OAuth 2.0 and OpenID Connect protocols, their authentication flows, and application through real-world case studies."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/27_oauth2YOpenidConnectFlujosDeAutenticacionYCasosDeEstudio.png",
      },
      {
        title: {
          es: "Auth0: Implementación de Autenticación y Seguridad Web",
          en: "Auth0: Implementing Authentication and Web Security"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "22 horas (Aprobado el 6 de marzo de 2025)",
          en: "22 hours (Approved on March 6, 2025)"
        },
        description: {
          es: "Curso sobre el uso de Auth0 como proveedor de identidad para implementar autenticación y seguridad en aplicaciones web.",
          en: "Course on using Auth0 as an identity provider to implement authentication and security in web applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/28_auth0ImplementacionDeAutenticacionYSeguridadWeb.png",
      },
      {
        title: {
          es: "Laboratorio Profesional de Node.js: Autenticación",
          en: "Professional Node.js Lab: Authentication"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "7 horas (Aprobado el 4 de marzo de 2025)",
          en: "7 hours (Approved on March 4, 2025)"
        },
        description: {
          es: "Laboratorio práctico para implementar un flujo completo de autenticación en una aplicación backend con Node.js.",
          en: "Hands-on lab implementing a complete authentication flow in a Node.js backend application."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/29_laboratorioDeNodeJsAutenticacion.png",
      },
      {
        title: {
          es: "Introducción al Testing con JavaScript",
          en: "Introduction to Testing with JavaScript"
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
          es: "Curso introductorio al testing en JavaScript: tipos de pruebas, configuración de entornos y buenas prácticas de calidad de código.",
          en: "Introductory course on testing in JavaScript: test types, environment setup, and code quality best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/30_introduccionAlTestingConJavascript.png",
      },
      {
        title: {
          es: "End to End Testing para APIs REST con Node.js",
          en: "End-to-End Testing for REST APIs with Node.js"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 4 de marzo de 2025)",
          en: "17 hours (Approved on March 4, 2025)"
        },
        description: {
          es: "Curso sobre pruebas end-to-end para APIs REST construidas con Node.js, validando flujos completos de la aplicación.",
          en: "Course on end-to-end testing for REST APIs built with Node.js, validating complete application flows."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/31_endToEndTestingParaApisRestConNodeJs.png",
      },
      {
        title: {
          es: "Performance Testing en Node.js con K6",
          en: "Performance Testing in Node.js with K6"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 5 de marzo de 2025)",
          en: "19 hours (Approved on March 5, 2025)"
        },
        description: {
          es: "Curso sobre pruebas de rendimiento para aplicaciones Node.js utilizando la herramienta K6.",
          en: "Course on performance testing for Node.js applications using the K6 tool."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/32_performanceTestingEnNodeJsConK6.png",
      },
      {
        title: {
          es: "Fundamentos de Observabilidad",
          en: "Observability Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 6 de marzo de 2025)",
          en: "13 hours (Approved on March 6, 2025)"
        },
        description: {
          es: "Curso introductorio a la observabilidad en sistemas de software: logs, métricas y trazas para monitorear aplicaciones.",
          en: "Introductory course on observability in software systems: logs, metrics, and traces for monitoring applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/33_fundamentosDeObservabilidad.png",
      },
      {
        title: {
          es: "Automatización de Pruebas Backend con Cypress",
          en: "Backend Test Automation with Cypress"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 6 de marzo de 2025)",
          en: "16 hours (Approved on March 6, 2025)"
        },
        description: {
          es: "Curso sobre automatización de pruebas de backend utilizando Cypress para validar APIs y servicios.",
          en: "Course on automating backend tests using Cypress to validate APIs and services."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/34_automatizacionDePruebasBackendConCypress.png",
      },
      {
        title: {
          es: "GraphQL con Node.js",
          en: "GraphQL with Node.js"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 6 de marzo de 2025)",
          en: "18 hours (Approved on March 6, 2025)"
        },
        description: {
          es: "Curso introductorio a GraphQL implementado con Node.js: esquemas, resolvers y consultas eficientes.",
          en: "Introductory course on GraphQL implemented with Node.js: schemas, resolvers, and efficient queries."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/35_graphqlConNodeJs.png",
      },
      {
        title: {
          es: "Node.js: GraphQL con Apollo Server y Prisma CMS",
          en: "Node.js: GraphQL with Apollo Server and Prisma CMS"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 6 de marzo de 2025)",
          en: "12 hours (Approved on March 6, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de APIs GraphQL en Node.js usando Apollo Server junto con Prisma como capa de datos.",
          en: "Course on building GraphQL APIs in Node.js using Apollo Server together with Prisma as the data layer."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/36_nodeJsGraphqlConApolloServerYPrismaCms.png",
      },
      {
        title: {
          es: "Aplicaciones en Tiempo Real con Socket.io",
          en: "Real-Time Applications with Socket.io"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 8 de marzo de 2025)",
          en: "15 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso sobre la creación de aplicaciones en tiempo real usando Socket.io para comunicación bidireccional entre cliente y servidor.",
          en: "Course on building real-time applications using Socket.io for bidirectional client-server communication."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/37_aplicacionesEnTiempoRealConSocketIo.png",
      },
      {
        title: {
          es: "Laboratorio Profesional de Node.js: Clon de Calendly",
          en: "Professional Node.js Lab: Calendly Clone"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "7 horas (Aprobado el 8 de marzo de 2025)",
          en: "7 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Laboratorio práctico orientado a construir un clon funcional de Calendly con Node.js, aplicando lógica de agendamiento.",
          en: "Hands-on lab building a functional Calendly clone with Node.js, applying scheduling logic."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/38_laboratorioDeNodeJsClonDeCalendly.png",
      },
      {
        title: {
          es: "Backend con NestJS",
          en: "Backend with NestJS"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 8 de marzo de 2025)",
          en: "11 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso introductorio a NestJS para construir aplicaciones backend estructuradas y escalables sobre Node.js.",
          en: "Introductory course on NestJS for building structured, scalable backend applications on top of Node.js."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/39_backendConNestjs.png",
      },
      {
        title: {
          es: "NestJS: Programación Modular",
          en: "NestJS: Modular Programming"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 8 de marzo de 2025)",
          en: "12 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso sobre la organización modular de aplicaciones NestJS para mejorar la mantenibilidad y escalabilidad del código.",
          en: "Course on organizing NestJS applications modularly to improve code maintainability and scalability."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/40_nestjsProgramacionModular.png",
      },
      {
        title: {
          es: "NestJS: Persistencia de Datos con TypeORM",
          en: "NestJS: Data Persistence with TypeORM"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "23 horas (Aprobado el 8 de marzo de 2025)",
          en: "23 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso sobre la integración de NestJS con TypeORM para gestionar la persistencia de datos en bases de datos relacionales.",
          en: "Course on integrating NestJS with TypeORM to manage data persistence in relational databases."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/41_nestjsPersistenciaDeDatosConTypeorm.png",
      },
      {
        title: {
          es: "NestJS: Persistencia de Datos con MongoDB",
          en: "NestJS: Data Persistence with MongoDB"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 8 de marzo de 2025)",
          en: "13 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso sobre la integración de NestJS con MongoDB para la persistencia de datos en aplicaciones basadas en documentos.",
          en: "Course on integrating NestJS with MongoDB for data persistence in document-based applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/42_nestjsPersistenciaDeDatosConMongodb.png",
      },
      {
        title: {
          es: "NestJS: Autenticación con Passport y JWT",
          en: "NestJS: Authentication with Passport and JWT"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 8 de marzo de 2025)",
          en: "16 hours (Approved on March 8, 2025)"
        },
        description: {
          es: "Curso sobre la implementación de autenticación segura en NestJS utilizando Passport y tokens JWT.",
          en: "Course on implementing secure authentication in NestJS using Passport and JWT tokens."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/43_nestjsAutenticacionConPassportYJwt.png",
      },
      {
        title: {
          es: "Python",
          en: "Python"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "36 horas (Aprobado el 10 de marzo de 2025)",
          en: "36 hours (Approved on March 10, 2025)"
        },
        description: {
          es: "Curso completo de fundamentos de Python: sintaxis, estructuras de datos, funciones y manejo de archivos.",
          en: "Comprehensive Python fundamentals course: syntax, data structures, functions, and file handling."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/44_python.png",
      },
      {
        title: {
          es: "Python: Comprehensions, Funciones y Manejo de Errores",
          en: "Python: Comprehensions, Functions and Error Handling"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "21 horas (Aprobado el 12 de marzo de 2025)",
          en: "21 hours (Approved on March 12, 2025)"
        },
        description: {
          es: "Curso sobre comprehensions, funciones avanzadas y manejo de excepciones en Python para escribir código más limpio.",
          en: "Course on comprehensions, advanced functions, and exception handling in Python to write cleaner code."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/45_pythonComprehensionsFuncionesYManejoDeErrores.png",
      },
      {
        title: {
          es: "Python: Entornos Virtuales y Pip",
          en: "Python: Virtual Environments and Pip"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 18 de marzo de 2025)",
          en: "13 hours (Approved on March 18, 2025)"
        },
        description: {
          es: "Curso sobre la gestión de entornos virtuales y paquetes en Python utilizando pip para aislar dependencias de proyectos.",
          en: "Course on managing virtual environments and packages in Python using pip to isolate project dependencies."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/46_pythonEntornosVirtualesYPip.png",
      },
      {
        title: {
          es: "Unit Testing en Python",
          en: "Unit Testing in Python"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 19 de marzo de 2025)",
          en: "15 hours (Approved on March 19, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias en Python, cubriendo frameworks de testing y buenas prácticas para asegurar la calidad del código.",
          en: "Course on unit testing in Python, covering testing frameworks and best practices to ensure code quality."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/47_unitTestingEnPython.png",
      },
      {
        title: {
          es: "Patrones de Diseño y SOLID en Python",
          en: "Design Patterns and SOLID in Python"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 21 de marzo de 2025)",
          en: "12 hours (Approved on March 21, 2025)"
        },
        description: {
          es: "Curso sobre la aplicación de patrones de diseño y los principios SOLID en proyectos escritos con Python.",
          en: "Course on applying design patterns and SOLID principles in Python projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/48_patronesDeDisenoYSolidEnPython.png",
      },
      {
        title: {
          es: "Django",
          en: "Django"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "22 horas (Aprobado el 28 de marzo de 2025)",
          en: "22 hours (Approved on March 28, 2025)"
        },
        description: {
          es: "Curso introductorio al framework Django para construir aplicaciones web robustas con Python.",
          en: "Introductory course on the Django framework for building robust web applications with Python."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/49_django.png",
      },
      {
        title: {
          es: "Django REST Framework",
          en: "Django REST Framework"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 28 de marzo de 2025)",
          en: "11 hours (Approved on March 28, 2025)"
        },
        description: {
          es: "Curso sobre Django REST Framework para construir APIs REST robustas y escalables sobre Django.",
          en: "Course on Django REST Framework for building robust, scalable REST APIs on top of Django."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/50_djangoRestFramework.png",
      },
      {
        title: {
          es: "FastAPI",
          en: "FastAPI"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "19 horas (Aprobado el 28 de marzo de 2025)",
          en: "19 hours (Approved on March 28, 2025)"
        },
        description: {
          es: "Curso sobre FastAPI, un framework moderno de Python para construir APIs de alto rendimiento con tipado y documentación automática.",
          en: "Course on FastAPI, a modern Python framework for building high-performance APIs with typing and automatic documentation."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/51_fastapi.png",
      },
      {
        title: {
          es: "Flask",
          en: "Flask"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 30 de marzo de 2025)",
          en: "12 hours (Approved on March 30, 2025)"
        },
        description: {
          es: "Curso introductorio a Flask, un microframework de Python para construir aplicaciones web y APIs ligeras.",
          en: "Introductory course on Flask, a Python microframework for building lightweight web applications and APIs."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/52_flask.png",
      },
      {
        title: {
          es: "Complejidad Algorítmica con Python",
          en: "Algorithmic Complexity with Python"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 30 de marzo de 2025)",
          en: "13 hours (Approved on March 30, 2025)"
        },
        description: {
          es: "Curso sobre análisis de complejidad algorítmica (Big O) aplicado a estructuras y algoritmos escritos en Python.",
          en: "Course on algorithmic complexity analysis (Big O) applied to data structures and algorithms written in Python."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/53_complejidadAlgoritmicaConPython.png",
      },
      {
        title: {
          es: "Estructuras de Datos Lineales con Python",
          en: "Linear Data Structures with Python"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 30 de marzo de 2025)",
          en: "15 hours (Approved on March 30, 2025)"
        },
        description: {
          es: "Curso sobre la implementación de estructuras de datos lineales (listas, pilas, colas) utilizando Python.",
          en: "Course on implementing linear data structures (lists, stacks, queues) using Python."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/54_estructurasDeDatosLinealesConPython.png",
      },
      {
        title: {
          es: "Curso Básico de PHP: Instalación, Fundamentos y Operadores",
          en: "Basic PHP Course: Installation, Fundamentals and Operators"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 30 de marzo de 2025)",
          en: "18 hours (Approved on March 30, 2025)"
        },
        description: {
          es: "Curso básico de PHP cubriendo instalación del entorno, sintaxis fundamental, variables y operadores.",
          en: "Basic PHP course covering environment installation, core syntax, variables, and operators."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/55_basicoDePhpInstalacionFundamentosYOperadores.png",
      },
      {
        title: {
          es: "Curso Básico de PHP: Arreglos, Funciones y Estructuras de Control",
          en: "Basic PHP Course: Arrays, Functions and Control Structures"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "20 horas (Aprobado el 30 de marzo de 2025)",
          en: "20 hours (Approved on March 30, 2025)"
        },
        description: {
          es: "Curso básico de PHP centrado en arreglos, funciones y estructuras de control para resolver problemas comunes.",
          en: "Basic PHP course focused on arrays, functions, and control structures for solving common problems."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/56_basicoDePhpArreglosFuncionesYEstructurasDeControl.png",
      },
      {
        title: {
          es: "Curso Práctico de PHP",
          en: "Practical PHP Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 31 de marzo de 2025)",
          en: "10 hours (Approved on March 31, 2025)"
        },
        description: {
          es: "Curso práctico para reforzar los fundamentos de PHP mediante ejercicios y pequeños proyectos aplicados.",
          en: "Practical course reinforcing PHP fundamentals through applied exercises and small projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/57_practicoDePhp.png",
      },
      {
        title: {
          es: "Integración de PHP con HTML",
          en: "PHP Integration with HTML"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 31 de marzo de 2025)",
          en: "14 hours (Approved on March 31, 2025)"
        },
        description: {
          es: "Curso sobre la integración de PHP con HTML para generar contenido dinámico en páginas web.",
          en: "Course on integrating PHP with HTML to generate dynamic content in web pages."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/58_integracionDePhpConHtml.png",
      },
      {
        title: {
          es: "Introducción a PHP con Composer",
          en: "Introduction to PHP with Composer"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "6 horas (Aprobado el 3 de abril de 2025)",
          en: "6 hours (Approved on April 3, 2025)"
        },
        description: {
          es: "Curso introductorio al uso de Composer como gestor de dependencias en proyectos PHP.",
          en: "Introductory course on using Composer as a dependency manager in PHP projects."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/59_introduccionAPhpConComposer.png",
      },
      {
        title: {
          es: "Manejo de Datos en PHP",
          en: "Data Handling in PHP"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "8 horas (Aprobado el 12 de abril de 2025)",
          en: "8 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre el manejo y procesamiento de datos en aplicaciones PHP, incluyendo formularios y validación.",
          en: "Course on handling and processing data in PHP applications, including forms and validation."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/60_manejoDeDatosEnPhp.png",
      },
      {
        title: {
          es: "Curso Intermedio de PHP: Entornos Virtuales y Profundización",
          en: "Intermediate PHP: Virtual Environments and Deep Dive"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 10 de abril de 2025)",
          en: "14 hours (Approved on April 10, 2025)"
        },
        description: {
          es: "Curso intermedio de PHP sobre configuración de entornos virtuales y profundización en conceptos del lenguaje.",
          en: "Intermediate PHP course on configuring virtual environments and deepening language concepts."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/61_phpEntornosVirtualesYProfundizacion.png",
      },
      {
        title: {
          es: "Programación Orientada a Objetos en PHP",
          en: "Object-Oriented Programming in PHP"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "8 horas (Aprobado el 9 de abril de 2025)",
          en: "8 hours (Approved on April 9, 2025)"
        },
        description: {
          es: "Curso sobre los fundamentos de la programación orientada a objetos en PHP: clases, herencia y encapsulamiento.",
          en: "Course on object-oriented programming fundamentals in PHP: classes, inheritance, and encapsulation."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/62_programacionOrientadaAObjetosEnPhp.png",
      },
      {
        title: {
          es: "Curso Intermedio de PHP: Cookies, Sesiones y Modularización",
          en: "Intermediate PHP: Cookies, Sessions and Modularization"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 10 de abril de 2025)",
          en: "17 hours (Approved on April 10, 2025)"
        },
        description: {
          es: "Curso intermedio de PHP sobre el manejo de cookies, sesiones de usuario y modularización del código.",
          en: "Intermediate PHP course on handling cookies, user sessions, and code modularization."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/63_phpCookiesSesionesYModularizacion.png",
      },
      {
        title: {
          es: "Curso Intermedio de PHP: Conexión a Bases de Datos",
          en: "Intermediate PHP: Database Connections"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "22 horas (Aprobado el 10 de abril de 2025)",
          en: "22 hours (Approved on April 10, 2025)"
        },
        description: {
          es: "Curso intermedio sobre la conexión de aplicaciones PHP a bases de datos para la gestión de información persistente.",
          en: "Intermediate course on connecting PHP applications to databases for managing persistent information."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/64_phpConexionABasesDeDatos.png",
      },
      {
        title: {
          es: "Introducción a Frameworks con PHP",
          en: "Introduction to Frameworks with PHP"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "3 horas (Aprobado el 10 de abril de 2025)",
          en: "3 hours (Approved on April 10, 2025)"
        },
        description: {
          es: "Curso introductorio al ecosistema de frameworks de PHP y sus ventajas frente al desarrollo sin framework.",
          en: "Introductory course on the PHP framework ecosystem and its advantages over framework-less development."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/65_introduccionAFrameworksConPhp.png",
      },
      {
        title: {
          es: "Desarrollo Web con PHP y Yii2",
          en: "Web Development with PHP and Yii2"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "18 horas (Aprobado el 10 de abril de 2025)",
          en: "18 hours (Approved on April 10, 2025)"
        },
        description: {
          es: "Curso sobre el desarrollo de aplicaciones web con el framework Yii2 sobre PHP.",
          en: "Course on building web applications with the Yii2 framework on top of PHP."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/66_desarrolloWebConPhpYYii2.png",
      },
      {
        title: {
          es: "Introducción a Laravel 9",
          en: "Introduction to Laravel 9"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 11 de abril de 2025)",
          en: "13 hours (Approved on April 11, 2025)"
        },
        description: {
          es: "Curso introductorio a Laravel 9: estructura del proyecto, rutas, controladores y vistas básicas.",
          en: "Introductory course on Laravel 9: project structure, routes, controllers, and basic views."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/67_introduccionALaravel9.png",
      },
      {
        title: {
          es: "Curso Básico de Testing con PHP y Laravel",
          en: "Basic Testing Course with PHP and Laravel"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 12 de abril de 2025)",
          en: "10 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso básico sobre pruebas automatizadas en aplicaciones PHP construidas con Laravel.",
          en: "Basic course on automated testing in PHP applications built with Laravel."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/68_basicoDeTestingConPhpYLaravel.png",
      },
      {
        title: {
          es: "Desarrollo de Aplicaciones en Laravel con TDD",
          en: "Building Applications in Laravel with TDD"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 12 de abril de 2025)",
          en: "15 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre desarrollo guiado por pruebas (TDD) aplicado a la construcción de aplicaciones con Laravel.",
          en: "Course on test-driven development (TDD) applied to building applications with Laravel."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/69_desarrolloDeAplicacionesEnLaravelConTdd.png",
      },
      {
        title: {
          es: "Laravel: Interfaces Dinámicas con Livewire",
          en: "Laravel: Dynamic Interfaces with Livewire"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "17 horas (Aprobado el 12 de abril de 2025)",
          en: "17 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre Livewire para construir interfaces dinámicas en Laravel sin escribir JavaScript adicional.",
          en: "Course on Livewire for building dynamic interfaces in Laravel without writing extra JavaScript."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/70_laravelInterfacesDinamicasConLivewire.png",
      },
      {
        title: {
          es: "API REST con Laravel",
          en: "REST API with Laravel"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 12 de abril de 2025)",
          en: "10 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de APIs REST con Laravel, incluyendo rutas, recursos y respuestas JSON.",
          en: "Course on building REST APIs with Laravel, including routes, resources, and JSON responses."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/71_apiRestConLaravel.png",
      },
      {
        title: {
          es: "Fundamentos de Symfony 6",
          en: "Symfony 6 Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 12 de abril de 2025)",
          en: "10 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso introductorio a Symfony 6: estructura del framework, bundles y configuración básica.",
          en: "Introductory course on Symfony 6: framework structure, bundles, and basic configuration."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/72_fundamentosDeSymfony6.png",
      },
      {
        title: {
          es: "Formularios en Symfony",
          en: "Forms in Symfony"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 12 de abril de 2025)",
          en: "10 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre la creación y validación de formularios en aplicaciones construidas con Symfony.",
          en: "Course on creating and validating forms in applications built with Symfony."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/73_formulariosEnSymfony.png",
      },
      {
        title: {
          es: "Symfony 6: Creación de API REST",
          en: "Symfony 6: Building a REST API"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 12 de abril de 2025)",
          en: "12 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de APIs REST con Symfony 6, cubriendo rutas, serialización y respuestas.",
          en: "Course on building REST APIs with Symfony 6, covering routes, serialization, and responses."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/74_symfony6CreacionDeApiRest.png",
      },
      {
        title: {
          es: "Bases de Datos en Symfony",
          en: "Databases in Symfony"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 13 de abril de 2025)",
          en: "11 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre la integración de bases de datos en Symfony mediante Doctrine ORM.",
          en: "Course on integrating databases in Symfony using Doctrine ORM."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/75_basesDeDatosEnSymfony.png",
      },
      {
        title: {
          es: "Curso Práctico de Symfony",
          en: "Practical Symfony Course"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "11 horas (Aprobado el 12 de abril de 2025)",
          en: "11 hours (Approved on April 12, 2025)"
        },
        description: {
          es: "Curso práctico para aplicar los conceptos de Symfony en el desarrollo de una aplicación completa.",
          en: "Practical course applying Symfony concepts to the development of a complete application."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/76_practicoDeSymfony.png",
      },
      {
        title: {
          es: "Curso Básico de C#: Fundamentos, Variables y Operadores",
          en: "Basic C# Course: Fundamentals, Variables and Operators"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 13 de abril de 2025)",
          en: "12 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso básico de C# cubriendo sintaxis fundamental, variables, tipos de datos y operadores.",
          en: "Basic C# course covering core syntax, variables, data types, and operators."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/77_basicoDeCsharpFundamentosVariablesYOperadores.png",
      },
      {
        title: {
          es: "Buenas Prácticas y Código Limpio en C#",
          en: "Best Practices and Clean Code in C#"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "10 horas (Aprobado el 13 de abril de 2025)",
          en: "10 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre buenas prácticas y principios de código limpio aplicados al desarrollo con C#.",
          en: "Course on best practices and clean code principles applied to C# development."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/78_buenasPracticasYCodigoLimpioEnCsharp.png",
      },
      {
        title: {
          es: "Principios SOLID en C# y .NET",
          en: "SOLID Principles in C# and .NET"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "16 horas (Aprobado el 13 de abril de 2025)",
          en: "16 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre la aplicación de los principios SOLID en proyectos desarrollados con C# y .NET.",
          en: "Course on applying SOLID principles in projects developed with C# and .NET."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/79_principiosSolidEnCsharpYDotnet.png",
      },
      {
        title: {
          es: "C#: Manejo de Datos con LINQ",
          en: "C#: Data Handling with LINQ"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 13 de abril de 2025)",
          en: "15 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre el uso de LINQ en C# para consultar y transformar colecciones de datos de forma expresiva.",
          en: "Course on using LINQ in C# to query and transform data collections expressively."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/80_csharpManejoDeDatosConLinq.png",
      },
      {
        title: {
          es: "Fundamentos de .NET",
          en: ".NET Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "12 horas (Aprobado el 13 de abril de 2025)",
          en: "12 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso introductorio a la plataforma .NET: su ecosistema, SDK y estructura de proyectos.",
          en: "Introductory course on the .NET platform: its ecosystem, SDK, and project structure."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/81_fundamentosDeDotnet.png",
      },
      {
        title: {
          es: "Fundamentos de Entity Framework",
          en: "Entity Framework Fundamentals"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "15 horas (Aprobado el 13 de abril de 2025)",
          en: "15 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso introductorio a Entity Framework como ORM para gestionar el acceso a datos en aplicaciones .NET.",
          en: "Introductory course on Entity Framework as an ORM for managing data access in .NET applications."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/82_fundamentosDeEntityFramework.png",
      },
      {
        title: {
          es: "APIs con .NET",
          en: "APIs with .NET"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 13 de abril de 2025)",
          en: "13 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre la construcción de APIs REST utilizando .NET, cubriendo controladores, rutas y respuestas HTTP.",
          en: "Course on building REST APIs using .NET, covering controllers, routes, and HTTP responses."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/83_apisConDotnet.png",
      },
      {
        title: {
          es: "Unit Testing con C# y .NET",
          en: "Unit Testing with C# and .NET"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "14 horas (Aprobado el 13 de abril de 2025)",
          en: "14 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre pruebas unitarias en aplicaciones C# y .NET, cubriendo frameworks de testing y buenas prácticas.",
          en: "Course on unit testing in C# and .NET applications, covering testing frameworks and best practices."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/84_unitTestingConCsharpYDotnet.png",
      },
      {
        title: {
          es: "Aplicaciones Web con Blazor WebAssembly y .NET",
          en: "Web Applications with Blazor WebAssembly and .NET"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 13 de abril de 2025)",
          en: "13 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre el desarrollo de aplicaciones web interactivas con Blazor WebAssembly sobre .NET.",
          en: "Course on developing interactive web applications with Blazor WebAssembly on top of .NET."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/85_aplicacionesWebConBlazorWebassemblyYDotnet.png",
      },
      {
        title: {
          es: "Azure DevOps: Flujos de CI/CD",
          en: "Azure DevOps: CI/CD Pipelines"
        },
        institution: {
          es: "Platzi",
          en: "Platzi"
        },
        duration: {
          es: "13 horas (Aprobado el 13 de abril de 2025)",
          en: "13 hours (Approved on April 13, 2025)"
        },
        description: {
          es: "Curso sobre la configuración de flujos de integración y despliegue continuo (CI/CD) con Azure DevOps.",
          en: "Course on configuring continuous integration and deployment (CI/CD) pipelines with Azure DevOps."
        },
        logo: "/images/education/platzi/platzi-logo.png",
        certificate: "/images/education/platzi/backend/86_azureDevopsFlujosDeCicd.png",
      },
    ],
  },
  // More categories and items can be added following the same pattern
];
