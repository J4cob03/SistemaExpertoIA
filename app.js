/**
 * app.js
 *
 * Controlador de interfaz para el sistema experto de viabilidad empresarial.
 * Gestiona el wizard de preguntas, la interacción del usuario
 * y la presentación de resultados.
 */

"use strict";

/* Preguntas del cuestionario */

const PREGUNTAS = [
    {
        id: "tipo_negocio",
        texto: "¿Qué tipo de negocio deseas abrir?",
        ayuda: "Selecciona el giro principal de tu futuro negocio.",
        opciones: [
            { valor: "comida_bebida", etiqueta: "Alimentos y Bebidas", detalle: "Restaurantes, cafeterías, repostería, bares" },
            { valor: "comercio_productos", etiqueta: "Comercio Minorista / Retail", detalle: "Venta de ropa, zapatos, tecnología, accesorios" },
            { valor: "servicios_profesionales", etiqueta: "Servicios y Consultoría", detalle: "Consultoría, salones de belleza, mantenimiento" },
            { valor: "comercio_basico", etiqueta: "Comercio Básico / Abarrotes", detalle: "Misceláneas, mini-súper, ferreterías de barrio" },
            { valor: "manufactura_produccion", etiqueta: "Manufactura o Producción", detalle: "Talleres, pequeñas fábricas, artesanías" },
            { valor: "tecnologia_digital", etiqueta: "Negocio Digital / E-commerce", detalle: "Tiendas en línea, desarrollo de software, apps" },
            { valor: "salud_bienestar", etiqueta: "Salud y Bienestar", detalle: "Clínicas, consultorios, gimnasios, spas" },
            { valor: "educacion_capacitacion", etiqueta: "Educación y Capacitación", detalle: "Escuelas, academias, cursos, tutorías" },
            { valor: "entretenimiento_ocio", etiqueta: "Entretenimiento y Ocio", detalle: "Canchas, salones de eventos, turismo" },
            { valor: "logistica_transporte", etiqueta: "Logística y Transporte", detalle: "Paquetería, fletes, transporte de pasajeros" }
        ]
    },
    {
        id: "tamano_local",
        texto: "¿Qué tamaño tendrá el local o espacio comercial?",
        ayuda: "Estima el espacio necesario para operar tu modelo de negocio.",
        opciones: [
            { valor: "pequeno", etiqueta: "Pequeño", detalle: "Local básico o espacio menor a 50m²" },
            { valor: "mediano", etiqueta: "Mediano", detalle: "Local estándar entre 50m² y 150m²" },
            { valor: "grande", etiqueta: "Grande", detalle: "Local amplio o bodega mayor a 150m²" }
        ]
    },
    {
        id: "zona_economica",
        texto: "¿En qué tipo de zona se ubicará tu negocio?",
        ayuda: "Esto ajusta los umbrales de capital según el contexto económico de tu región.",
        opciones: [
            { valor: "zona_local",         etiqueta: "Ciudad pequeña o municipio",   detalle: "Menos de 300,000 hab. — ej. Tampico, Madero, Altamira, Córdoba, Coatzacoalcos" },
            { valor: "ciudad_media",       etiqueta: "Ciudad mediana",               detalle: "Entre 300,000 y 1.5 millones de hab. — ej. Mérida, Querétaro, Puebla, León, Tijuana" },
            { valor: "zona_metropolitana", etiqueta: "Zona metropolitana grande",    detalle: "Más de 1.5 millones de hab. — ej. Ciudad de México, Monterrey, Guadalajara" }
        ]
    },
    {
        id: "capital_numerico",
        texto: "¿Cuál es tu capital de inversión inicial disponible?",
        ayuda: "Ingresa la cantidad exacta de fondos disponibles en tu moneda local (MXN).",
        tipo: "numero"
    },
    {
        id: "flujo_personas",
        texto: "¿Cómo es el flujo de personas frente al local?",
        ayuda: "Observa el tráfico peatonal en diferentes horarios.",
        opciones: [
            { valor: "alto_constante", etiqueta: "Muy alto y constante", detalle: "Personas pasan y se detienen con frecuencia" },
            { valor: "alto_rapido", etiqueta: "Alto pero rápido", detalle: "Personas pasan sin detenerse" },
            { valor: "moderado", etiqueta: "Moderado", detalle: "Tránsito ocasional" },
            { valor: "bajo", etiqueta: "Bajo", detalle: "Poco flujo de personas" }
        ]
    },
    {
        id: "visibilidad",
        texto: "¿Qué tan visible es el local desde la calle principal?",
        ayuda: "Evalúa qué tan fácil es que alguien nuevo note el negocio.",
        opciones: [
            { valor: "total", etiqueta: "Totalmente visible", detalle: "Fachada clara, sin obstáculos" },
            { valor: "bastante", etiqueta: "Bastante visible", detalle: "Ligeros obstáculos o menor exposición" },
            { valor: "poco", etiqueta: "Poco visible", detalle: "Difícil de notar a simple vista" },
            { valor: "oculto", etiqueta: "Prácticamente oculto", detalle: "Tapado o fuera de vista directa" }
        ]
    },
    {
        id: "negocios_ancla",
        texto: "¿Qué tan cerca hay negocios ancla (supermercados, bancos, tiendas grandes)?",
        ayuda: "Los negocios ancla atraen volumen de gente que podrías captar.",
        opciones: [
            { valor: "muy_cerca", etiqueta: "Muy cerca", detalle: "Menos de 2 minutos caminando" },
            { valor: "cerca", etiqueta: "Relativamente cerca", detalle: "Entre 2 y 5 minutos" },
            { valor: "lejos", etiqueta: "Lejos", detalle: "Más de 5 minutos" },
            { valor: "no_hay", etiqueta: "No hay", detalle: "No hay negocios ancla cercanos" }
        ]
    },
    {
        id: "historial_local",
        texto: "¿Cuál es el historial reciente del local?",
        ayuda: "Los cierres frecuentes pueden indicar una ubicación inconveniente.",
        opciones: [
            { valor: "estable", etiqueta: "Estable", detalle: "Negocios anteriores han sido estables y duraderos" },
            { valor: "cambios_leves", etiqueta: "Cambios ocasionales", detalle: "Ha habido algunos cambios, pero con cierta estabilidad" },
            { valor: "cambios_frecuentes", etiqueta: "Cambios frecuentes", detalle: "Los negocios duran poco tiempo" },
            { valor: "cierres_rapidos", etiqueta: "Cierres rápidos", detalle: "Muchos negocios han cerrado rápidamente" }
        ]
    },
    {
        id: "saturacion_zona",
        texto: "¿Qué tan saturada está la zona con negocios similares al tuyo?",
        ayuda: "Analiza cuántos competidores directos están cerca.",
        opciones: [
            { valor: "muy_baja", etiqueta: "Muy baja", detalle: "Casi no hay competencia directa" },
            { valor: "baja", etiqueta: "Baja", detalle: "Hay pocos negocios similares" },
            { valor: "moderada", etiqueta: "Moderada", detalle: "Varios negocios similares" },
            { valor: "alta", etiqueta: "Alta", detalle: "Zona saturada de negocios iguales" }
        ]
    },
    {
        id: "impacto_negativo",
        texto: "¿Existen negocios cercanos que puedan afectar negativamente tu operación?",
        ayuda: "Ejemplo: ruido excesivo, inseguridad o mala imagen.",
        opciones: [
            { valor: "no_impacto", etiqueta: "No, entorno favorable", detalle: "El entorno es limpio y favorable" },
            { valor: "minimo", etiqueta: "Impacto mínimo", detalle: "No afecta significativamente" },
            { valor: "moderado", etiqueta: "Impacto moderado", detalle: "Puede influir en clientes" },
            { valor: "alto_impacto", etiqueta: "Impacto alto", detalle: "Ruido, inseguridad o mala imagen" }
        ]
    },
    {
        id: "seguridad",
        texto: "¿Cómo percibes la seguridad de la zona?",
        ayuda: "Un factor clave para que los clientes te visiten, especialmente de noche.",
        opciones: [
            { valor: "muy_segura", etiqueta: "Muy segura", detalle: "Bien iluminada, actividad constante" },
            { valor: "segura", etiqueta: "Segura", detalle: "Condiciones aceptables" },
            { valor: "poco_segura", etiqueta: "Poco segura", detalle: "Algunas señales negativas" },
            { valor: "insegura", etiqueta: "Insegura", detalle: "Ambiente riesgoso o poco confiable" }
        ]
    },
    {
        id: "accesibilidad",
        texto: "¿Qué tan accesible es el local para los clientes?",
        ayuda: "Considera estacionamiento, transporte público, banquetas.",
        opciones: [
            { valor: "muy_accesible", etiqueta: "Muy accesible", detalle: "Estacionamiento o transporte cercano" },
            { valor: "accesible", etiqueta: "Accesible", detalle: "Con algunas limitaciones" },
            { valor: "poco_accesible", etiqueta: "Poco accesible", detalle: "Dificultad para llegar" },
            { valor: "dificil", etiqueta: "Difícil acceso", detalle: "Problemas importantes de llegada" }
        ]
    },
    {
        id: "demanda",
        texto: "¿Cuál es la demanda estimada de tu producto o servicio?",
        ayuda: "Basa tu estimación en investigación de mercado, tendencias o datos de la industria.",
        opciones: [
            {
                valor: "baja",
                etiqueta: "Baja — nicho muy reducido",
                detalle: "El mercado potencial es pequeño y puede ser insuficiente para sostener el negocio"
            },
            {
                valor: "media",
                etiqueta: "Media — mercado moderado y constante",
                detalle: "Hay demanda sostenida aunque el mercado no es masivo"
            },
            {
                valor: "alta",
                etiqueta: "Alta — mercado amplio y en crecimiento",
                detalle: "Gran número de clientes potenciales con necesidad identificada"
            },
            {
                valor: "muy_alta",
                etiqueta: "Muy alta — necesidad masiva o tendencia al alza",
                detalle: "Producto o servicio de alta necesidad con mercado en expansión"
            }
        ]
    },
    {
        id: "costo_local",
        texto: "¿Cuál es la situación del costo del local (renta o uso del espacio)?",
        ayuda: "Proporción del costo del espacio contra tus ingresos esperados.",
        opciones: [
            { valor: "sin_costo", etiqueta: "Sin costo", detalle: "Local propio o familiar" },
            { valor: "bajo", etiqueta: "Bajo costo", detalle: "Menos del 20% de ingresos estimados" },
            { valor: "moderado", etiqueta: "Costo moderado", detalle: "Entre 20% y 30%" },
            { valor: "alto", etiqueta: "Costo alto", detalle: "Más del 30% de ingresos" }
        ]
    },
    {
        id: "experiencia",
        texto: "¿Cuánta experiencia tienes en este sector o giro de negocio?",
        ayuda: "Considera experiencia laboral, formación académica y proyectos previos relacionados.",
        opciones: [
            {
                valor: "ninguna",
                etiqueta: "Ninguna — es un campo completamente nuevo para mí",
                detalle: "No se tiene conocimiento previo del sector; requiere aprendizaje intensivo"
            },
            {
                valor: "poca",
                etiqueta: "Poca — menos de 1 año de exposición al sector",
                detalle: "Conocimiento básico, suficiente para entender el sector pero limitado"
            },
            {
                valor: "moderada",
                etiqueta: "Moderada — entre 1 y 3 años en el sector",
                detalle: "Experiencia funcional con conocimiento de retos y oportunidades comunes"
            },
            {
                valor: "amplia",
                etiqueta: "Amplia — más de 3 años en el sector",
                detalle: "Conocimiento profundo del sector, redes de contacto y experiencia en problemas reales"
            }
        ]
    },
    {
        id: "plan_negocio",
        texto: "¿Cuentas con un plan de negocio documentado?",
        ayuda: "Un plan de negocio detalla objetivos, estrategia, finanzas proyectadas y modelo operativo.",
        opciones: [
            {
                valor: "ninguno",
                etiqueta: "No tengo plan de negocio",
                detalle: "Solo hay una idea general sin documentación estructurada"
            },
            {
                valor: "basico",
                etiqueta: "Plan básico — objetivos e idea general documentados",
                detalle: "Hay documentación inicial pero falta profundidad en finanzas y estrategia"
            },
            {
                valor: "completo",
                etiqueta: "Plan completo — con proyecciones financieras y estrategia",
                detalle: "Documentación detallada con análisis de mercado, finanzas y plan operativo"
            }
        ]
    },
    {
        id: "diferenciador",
        texto: "¿Qué tan diferenciada es tu propuesta frente a la competencia?",
        ayuda: "Es aquello que hace a tu negocio único frente a los que ya existen.",
        opciones: [
            { valor: "muy_diferenciada", etiqueta: "Muy diferenciada", detalle: "Oferta única o difícil de replicar" },
            { valor: "diferenciada", etiqueta: "Diferenciada", detalle: "Con ventajas claras" },
            { valor: "poco_diferenciada", etiqueta: "Poco diferenciada", detalle: "Similar a otros negocios" },
            { valor: "nada_diferenciada", etiqueta: "Nada diferenciada", detalle: "Prácticamente igual a la competencia" }
        ]
    },
    {
        id: "dedicacion",
        texto: "¿Cuánto tiempo dedicarás a operar el negocio directamente?",
        ayuda: "La presencia del dueño en los primeros meses suele ser crítica para el éxito.",
        opciones: [
            { valor: "baja", etiqueta: "Delegado a terceros (Inversionista)", detalle: "Contrataré a alguien para que lo opere al 100%" },
            { valor: "media", etiqueta: "Medio tiempo / Fines de semana", detalle: "Mantendré otro trabajo o actividad principal" },
            { valor: "alta", etiqueta: "Tiempo completo", detalle: "Estaré operándolo y supervisándolo todo el día" }
        ]
    },
    {
        id: "permisos",
        texto: "¿Has investigado o cuentas con los permisos para operar?",
        ayuda: "Los trámites gubernamentales, uso de suelo, permisos sanitarios, registros de marca, etc.",
        opciones: [
            { valor: "ninguno", etiqueta: "No lo he investigado", detalle: "No sé qué permisos requiero aún" },
            { valor: "investigado", etiqueta: "Tengo la información", detalle: "Sé lo que necesito pero no he empezado trámites" },
            { valor: "tramite", etiqueta: "En trámite o autorizados", detalle: "Ya comencé los trámites o ya los tengo" }
        ]
    },
    {
        id: "marketing_presupuesto",
        texto: "¿Tienes un plan o presupuesto para marketing y adquisición de clientes?",
        ayuda: "Definir cómo atraerás a tus primeros clientes es fundamental para sobrevivir los primeros meses.",
        opciones: [
            { valor: "ninguno", etiqueta: "Ninguno", detalle: "Dependeré exclusivamente del boca a boca" },
            { valor: "basico", etiqueta: "Básico", detalle: "Redes sociales gratuitas y promociones locales" },
            { valor: "moderado", etiqueta: "Moderado", detalle: "Presupuesto inicial para anuncios en línea o impresos" },
            { valor: "alto", etiqueta: "Alto", detalle: "Estrategia de marketing completa con presupuesto asignado" }
        ]
    },
    {
        id: "proveedores",
        texto: "¿Qué tan fácil es conseguir los insumos o productos que venderás?",
        ayuda: "La dependencia de proveedores únicos o lejanos puede afectar tu operación y costos.",
        opciones: [
            { valor: "muy_dificil", etiqueta: "Muy difícil", detalle: "Monopolio o importación compleja" },
            { valor: "moderado", etiqueta: "Moderado", detalle: "Pocas opciones, pero accesibles" },
            { valor: "facil", etiqueta: "Fácil", detalle: "Varias opciones de proveedores en la región" },
            { valor: "muy_facil", etiqueta: "Muy fácil", detalle: "Múltiples opciones locales y precios competitivos" }
        ]
    }
];

const PREGUNTAS_ACTIVAS = PREGUNTAS;


/* Nombres técnicos a lenguaje natural */

const NOMBRES_HECHOS = {
    "tipo_negocio": "Tipo de negocio",
    "tamano_local": "Tamaño del local",
    "capital_numerico": "Capital declarado",
    "capital": "Capital evaluado",
    "flujo_personas": "Flujo de personas",
    "visibilidad": "Visibilidad del local",
    "negocios_ancla": "Cercanía de negocios ancla",
    "historial_local": "Historial del local",
    "saturacion_zona": "Saturación de la zona",
    "impacto_negativo": "Impacto negativo cercano",
    "seguridad": "Seguridad de la zona",
    "accesibilidad": "Accesibilidad",
    "ubicacion": "Calidad de Ubicación (Deducida)",
    "demanda": "Demanda del producto o servicio",
    "costo_local": "Costo de renta del local",
    "experiencia": "Experiencia en el sector",
    "plan_negocio": "Plan de negocio",
    "diferenciador": "Diferenciador competitivo",
    "dedicacion": "Dedicación al negocio",
    "permisos": "Estado de permisos/licencias",
    "marketing_presupuesto": "Presupuesto de marketing",
    "proveedores": "Facilidad con proveedores",
    "situacion_financiera": "Situación financiera",
    "mercado_base": "Análisis inicial del mercado",
    "posicion_mercado":             "Posición final en el mercado",
    "preparacion_empresarial":      "Preparación empresarial",
    "preparacion_base":             "Preparación base",
    "preparacion_empresarial_temp": "Preparación preliminar",
    "competencia":                  "Nivel de competencia",
    "costos":                       "Costos operativos",
    "zona_economica":               "Zona económica",
    "veredicto":                    "Veredicto final"
};

const NOMBRES_VALORES = {
    /* Financiero */
    "critica": "Crítica",
    "deficiente": "Deficiente",
    "aceptable": "Aceptable",
    "solida": "Sólida",
    /* Mercado */
    "desfavorable": "Desfavorable",
    "neutral": "Neutral",
    "favorable": "Favorable",
    "muy_favorable": "Muy favorable",
    /* Preparación */
    "baja": "Baja",
    "media": "Media",
    "alta": "Alta",
    /* Entradas de negocio */
    "comida_bebida": "Alimentos y Bebidas",
    "comercio_productos": "Comercio / Retail",
    "servicios_profesionales": "Servicios y Consultoría",
    "comercio_basico": "Abarrotes / Básicos",
    "manufactura_produccion": "Manufactura / Producción",
    "tecnologia_digital": "Tecnología / Digital",
    "salud_bienestar": "Salud / Bienestar",
    "educacion_capacitacion": "Educación / Capacitación",
    "entretenimiento_ocio": "Entretenimiento / Ocio",
    "logistica_transporte": "Logística / Transporte",
    "pequeno": "Pequeño",
    "mediano": "Mediano",
    "grande": "Grande",
    /* Entradas de ubicacion y contexto */
    "alto_constante": "Muy alto y constante",
    "alto_rapido": "Alto pero rápido",
    "total": "Totalmente visible",
    "bastante": "Bastante visible",
    "poco": "Poco visible",
    "oculto": "Prácticamente oculto",
    "muy_cerca": "Muy cerca",
    "cerca": "Relativamente cerca",
    "lejos": "Lejos",
    "no_hay": "No hay negocios ancla",
    "estable": "Estable y duradero",
    "cambios_leves": "Cambios ocasionales",
    "cambios_frecuentes": "Cambios frecuentes",
    "cierres_rapidos": "Cierres rápidos",
    "muy_baja": "Muy baja",
    "no_impacto": "Ningún impacto negativo",
    "minimo": "Impacto mínimo",
    "alto_impacto": "Impacto alto",
    "muy_segura": "Muy segura",
    "segura": "Segura",
    "poco_segura": "Poco segura",
    "insegura": "Insegura",
    "muy_accesible": "Muy accesible",
    "accesible": "Accesible",
    "poco_accesible": "Poco accesible",
    "dificil": "Difícil acceso",
    "sin_costo": "Sin costo de renta",
    "muy_diferenciada": "Muy diferenciada",
    "diferenciada": "Diferenciada",
    "poco_diferenciada": "Poco diferenciada",
    "nada_diferenciada": "Nada diferenciada",
    "precio": "Liderazgo en precio",
    "calidad": "Alta calidad",
    "innovacion": "Innovación disruptiva",
    "investigado": "Investigado",
    "tramite": "En trámite/Aprobado",
    /* Entradas de capital */
    "muy_bajo": "Muy bajo",
    "bajo": "Bajo",
    "moderado": "Moderado",
    "alto": "Alto",
    /* Costos */
    "muy_altos": "Muy altos",
    "altos": "Altos",
    "moderados": "Moderados",
    "bajos": "Bajos",
    /* Demanda */
    "muy_alta": "Muy alta",
    /* Experiencia */
    "ninguna": "Ninguna",
    "poca": "Poca",
    "moderada": "Moderada",
    "amplia": "Amplia",
    /* Plan */
    "ninguno": "Sin plan de negocio",
    "basico": "Plan básico",
    "completo": "Plan completo",
    /* Ubicación */
    "mala": "Mala",
    "regular": "Regular",
    "buena": "Buena",
    "excelente": "Excelente",
    /* Zona económica */
    "zona_local": "Ciudad pequeña o municipio",
    "ciudad_media": "Ciudad mediana",
    "zona_metropolitana": "Zona metropolitana",
    /* Competencia */
    /* "alta", "media", "baja" ya cubiertos arriba */
    /* Nuevas opciones */
    "muy_dificil": "Muy difícil",
    "facil": "Fácil",
    "muy_facil": "Muy fácil",
    /* Conclusión */
    "no_recomendable": "No recomendable",
    "riesgoso": "Riesgoso",
    "viable": "Viable",
    "muy_viable": "Muy viable",
    "indeterminado": "Sin determinar"
};

/* Descripciones en lenguaje natural para cada combinación de factor + valor */
const DESCRIPCION_ESTADO = {
    situacion_financiera: {
        critica: "El capital disponible es insuficiente para cubrir los costos operativos. Esto representa el mayor riesgo del proyecto.",
        deficiente: "Los fondos son limitados en relación con los costos. Debes actuar rápido para generar ingresos o reducir gastos.",
        aceptable: "Tienes suficiente capital para empezar, pero es importante controlar los gastos desde el primer día.",
        solida: "Tu capital te da un margen cómodo para operar y crecer sin presión financiera inmediata."
    },
    posicion_mercado: {
        desfavorable: "El mercado presenta condiciones difíciles: poca demanda o mucha competencia hacen el camino cuesta arriba.",
        neutral: "El mercado tiene oportunidades y retos en equilibrio. La ejecución y diferenciación serán la clave.",
        favorable: "Hay demanda suficiente y la competencia no es un obstáculo mayor. Buenas condiciones para entrar.",
        muy_favorable: "Excelente oportunidad de mercado: hay alta demanda con poca competencia. Las condiciones son buenas para entrar."
    },
    preparacion_empresarial: {
        baja: "La falta de experiencia y/o plan de negocio aumenta significativamente el riesgo de cometer errores costosos.",
        media: "Tienes algo de base, pero reforzar el plan o buscar apoyo de alguien con experiencia mejoraría tus probabilidades.",
        alta: "Tu experiencia y planificación te dan una ventaja real para superar los retos del inicio."
    }
};

function traducirHecho(hecho) {
    return NOMBRES_HECHOS[hecho] || hecho;
}

function traducirValor(valor) {
    if (typeof valor === "number") return "$" + valor.toLocaleString("es-MX");
    return NOMBRES_VALORES[valor] || valor;
}


/* Estado de la aplicación */

const estado = {
    preguntaActual: 0,
    respuestas: {}
};


/* Dom */

let graficoResultados = null;

const dom = {
    landing: document.getElementById("landing"),
    quiz: document.getElementById("quiz"),
    resultados: document.getElementById("resultados"),

    btnIniciar: document.getElementById("btn-iniciar"),
    btnAnterior: document.getElementById("btn-anterior"),
    btnSiguiente: document.getElementById("btn-siguiente"),
    btnReiniciar: document.getElementById("btn-reiniciar"),
    btnImprimir: document.getElementById("btn-imprimir"),

    numeroPregunta: document.getElementById("numero-pregunta"),
    totalPreguntas: document.getElementById("total-preguntas"),
    porcentaje: document.getElementById("porcentaje"),
    barraProgreso: document.getElementById("barra-progreso"),

    textoPregunta: document.getElementById("texto-pregunta"),
    ayudaPregunta: document.getElementById("ayuda-pregunta"),
    contenedorOpciones: document.getElementById("contenedor-opciones"),

    tarjetaVeredicto: document.getElementById("tarjeta-veredicto"),
    iconoVeredicto: document.getElementById("icono-veredicto"),
    tituloVeredicto: document.getElementById("titulo-veredicto"),
    descVeredicto: document.getElementById("desc-veredicto"),
    numeroScore: document.getElementById("numero-score"),
    barraScore: document.getElementById("barra-score"),

    estadoFinanciero: document.getElementById("estado-financiero"),
    estadoMercado: document.getElementById("estado-mercado"),
    estadoPreparacion: document.getElementById("estado-preparacion"),
    textoFinanciero: document.getElementById("texto-financiero"),
    textoMercado: document.getElementById("texto-mercado"),
    textoPreparacion: document.getElementById("texto-preparacion"),

    cadenaReglas: document.getElementById("cadena-reglas"),
    listaRecomendaciones: document.getElementById("lista-recomendaciones")
};


/* Navegar entre secciones */

function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(el => {
        el.classList.remove("visible", "activo");
    });
    const seccion = document.getElementById(id);
    seccion.classList.add("visible");
    requestAnimationFrame(() => seccion.classList.add("activo"));
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* Renderizado de las preguntas */

function renderizarPregunta(indice) {
    const pregunta = PREGUNTAS_ACTIVAS[indice];
    const total = PREGUNTAS_ACTIVAS.length;
    const pct = Math.round(((indice + 1) / total) * 100);

    dom.numeroPregunta.textContent = indice + 1;
    dom.totalPreguntas.textContent = total;
    dom.porcentaje.textContent = pct + "%";
    dom.barraProgreso.style.width = pct + "%";
    dom.textoPregunta.textContent = pregunta.texto;
    dom.ayudaPregunta.textContent = pregunta.ayuda;

    dom.contenedorOpciones.innerHTML = "";

    if (pregunta.tipo === "numero") {
        const inputContainer = document.createElement("div");
        inputContainer.className = "tarjeta-opcion input-tarjeta";

        const inputElement = document.createElement("input");
        inputElement.type = "number";
        inputElement.className = "input-numerico";
        inputElement.placeholder = "Ej. 150000";
        inputElement.value = estado.respuestas[pregunta.id] || "";

        inputElement.addEventListener("input", (e) => {
            const val = e.target.value;
            if (val && !isNaN(val) && Number(val) > 0) {
                estado.respuestas[pregunta.id] = Number(val);
                dom.btnSiguiente.disabled = false;
            } else {
                delete estado.respuestas[pregunta.id];
                dom.btnSiguiente.disabled = true;
            }
        });

        inputContainer.appendChild(inputElement);
        dom.contenedorOpciones.appendChild(inputContainer);
    } else if (pregunta.id === "tipo_negocio") {
        const buscadorContenedor = document.createElement("div");
        buscadorContenedor.style.marginBottom = "15px";

        const inputBuscador = document.createElement("input");
        inputBuscador.type = "text";
        inputBuscador.className = "input-numerico";
        inputBuscador.placeholder = "Escribe para buscar (ej. restaurante, ropa, gym...)";
        inputBuscador.style.width = "100%";
        inputBuscador.style.boxSizing = "border-box";
        inputBuscador.style.padding = "15px";
        inputBuscador.style.fontSize = "1.1rem";
        inputBuscador.style.borderRadius = "8px";
        inputBuscador.style.border = "1px solid var(--borde)";

        buscadorContenedor.appendChild(inputBuscador);
        dom.contenedorOpciones.appendChild(buscadorContenedor);

        const listaOpciones = document.createElement("div");
        listaOpciones.style.maxHeight = "350px";
        listaOpciones.style.overflowY = "auto";
        listaOpciones.style.paddingRight = "5px";

        const tarjetas = [];

        pregunta.opciones.forEach(opcion => {
            const tarjeta = document.createElement("label");
            tarjeta.className = "tarjeta-opcion";
            if (estado.respuestas[pregunta.id] === opcion.valor) {
                tarjeta.classList.add("seleccionada");
            }

            tarjeta.innerHTML = `
                <input type="radio" name="pregunta_${pregunta.id}" value="${opcion.valor}" class="radio-oculto">
                <div class="opcion-contenido">
                    <span class="opcion-etiqueta">${opcion.etiqueta}</span>
                    <span class="opcion-detalle">${opcion.detalle}</span>
                </div>
                <span class="opcion-check">&#10003;</span>
            `;

            tarjeta.addEventListener("click", () => seleccionarOpcion(pregunta.id, opcion.valor, tarjeta));
            listaOpciones.appendChild(tarjeta);
            
            tarjetas.push({
                element: tarjeta,
                text: (opcion.etiqueta + " " + opcion.detalle).toLowerCase()
            });
        });

        dom.contenedorOpciones.appendChild(listaOpciones);

        inputBuscador.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            tarjetas.forEach(t => {
                if (t.text.includes(query)) {
                    t.element.style.display = "";
                } else {
                    t.element.style.display = "none";
                }
            });
        });
    } else {
        const listaOpciones = document.createElement("div");
        listaOpciones.style.maxHeight = "400px";
        listaOpciones.style.overflowY = "auto";
        listaOpciones.style.paddingRight = "5px";

        pregunta.opciones.forEach(opcion => {
            const tarjeta = document.createElement("label");
            tarjeta.className = "tarjeta-opcion";
            if (estado.respuestas[pregunta.id] === opcion.valor) {
                tarjeta.classList.add("seleccionada");
            }

            tarjeta.innerHTML = `
                <input type="radio" name="pregunta_${pregunta.id}" value="${opcion.valor}" class="radio-oculto">
                <div class="opcion-contenido">
                    <span class="opcion-etiqueta">${opcion.etiqueta}</span>
                    <span class="opcion-detalle">${opcion.detalle}</span>
                </div>
                <span class="opcion-check">&#10003;</span>
            `;

            tarjeta.addEventListener("click", () => seleccionarOpcion(pregunta.id, opcion.valor, tarjeta));
            listaOpciones.appendChild(tarjeta);
        });
        dom.contenedorOpciones.appendChild(listaOpciones);
    }

    dom.btnAnterior.disabled = indice === 0;
    dom.btnSiguiente.disabled = !estado.respuestas[pregunta.id];
    dom.btnSiguiente.textContent = indice === total - 1 ? "Ver resultados" : "Siguiente →";
}

function seleccionarOpcion(idPregunta, valor, tarjetaSeleccionada) {
    estado.respuestas[idPregunta] = valor;

    dom.contenedorOpciones.querySelectorAll(".tarjeta-opcion").forEach(t => {
        t.classList.remove("seleccionada");
    });
    tarjetaSeleccionada.classList.add("seleccionada");
    dom.btnSiguiente.disabled = false;
}


/* Cálculo del score */

const PUNTAJES = {
    capital: { muy_bajo: 0, bajo: 15, moderado: 35, alto: 50 },
    saturacion_zona: { alta: 0, moderada: 5, baja: 15, muy_baja: 20 },
    diferenciador: { nada_diferenciada: 0, poco_diferenciada: 5, diferenciada: 10, muy_diferenciada: 15 },
    flujo_personas: { bajo: 0, moderado: 5, alto_rapido: 10, alto_constante: 15 },
    visibilidad: { oculto: 0, poco: 5, bastante: 10, total: 15 },
    negocios_ancla: { no_hay: 0, lejos: 2, cerca: 5, muy_cerca: 10 },
    historial_local: { cierres_rapidos: 0, cambios_frecuentes: 2, cambios_leves: 5, estable: 10 },
    impacto_negativo: { alto_impacto: 0, moderado: 2, minimo: 5, no_impacto: 10 },
    seguridad: { insegura: 0, poco_segura: 2, segura: 5, muy_segura: 10 },
    accesibilidad: { dificil: 0, poco_accesible: 2, accesible: 5, muy_accesible: 10 },
    demanda: { baja: 0, media: 10, alta: 20, muy_alta: 25 },
    costo_local: { alto: 0, moderado: 5, bajo: 10, sin_costo: 15 },
    experiencia: { ninguna: 0, poca: 5, moderada: 10, amplia: 15 },
    plan_negocio: { ninguno: 0, basico: 5, completo: 10 },
    dedicacion: { baja: 0, media: 5, alta: 10 },
    permisos: { ninguno: 0, investigado: 5, tramite: 10 },
    marketing_presupuesto: { ninguno: 0, basico: 3, moderado: 7, alto: 10 },
    proveedores: { muy_dificil: 0, moderado: 3, facil: 7, muy_facil: 10 }
};

function calcularScore(respuestas) {
    let total = 0;
    let maximo = 0;

    for (const [hecho, escala] of Object.entries(PUNTAJES)) {
        maximo += Math.max(...Object.values(escala));
        if (respuestas[hecho] !== undefined) {
            total += escala[respuestas[hecho]] || 0;
        }
    }

    return Math.round((total / maximo) * 100);
}


/* Configuración de resultados */

const CONFIGURACION_VEREDICTO = {
    muy_viable: {
        titulo: "Muy Viable",
        descripcion: "Tu análisis muestra condiciones excelentes para abrir el negocio. Las probabilidades de éxito son altas si ejecutas con disciplina y seguimiento.",
        clase: "muy-viable",
        icono: "&#9650;"
    },
    viable: {
        titulo: "Viable",
        descripcion: "El negocio presenta condiciones favorables. Con una buena ejecución y monitoreo constante, tiene potencial real de éxito.",
        clase: "viable",
        icono: "&#9679;"
    },
    riesgoso: {
        titulo: "Riesgoso",
        descripcion: "Existen factores que aumentan el riesgo de fracaso. El negocio puede funcionar, pero hay alertas importantes que debes atender antes de invertir.",
        clase: "riesgoso",
        icono: "&#9651;"
    },
    no_recomendable: {
        titulo: "No Recomendable",
        descripcion: "Hay condiciones críticas que hacen muy probable el fracaso del negocio en su estado actual. Hay que replantear la idea antes de comprometer capital.",
        clase: "no-recomendable",
        icono: "&#9660;"
    },
    indeterminado: {
        titulo: "Sin determinar",
        descripcion: "No fue posible determinar un veredicto con la información proporcionada.",
        clase: "riesgoso",
        icono: "&#9632;"
    }
};

const ETIQUETAS_ESTADO = {
    critica: { texto: "Crítica", clase: "badge-rojo" },
    deficiente: { texto: "Deficiente", clase: "badge-naranja" },
    aceptable: { texto: "Aceptable", clase: "badge-amarillo" },
    solida: { texto: "Sólida", clase: "badge-verde" },
    desfavorable: { texto: "Desfavorable", clase: "badge-rojo" },
    neutral: { texto: "Neutral", clase: "badge-amarillo" },
    favorable: { texto: "Favorable", clase: "badge-verde-claro" },
    muy_favorable: { texto: "Muy favorable", clase: "badge-verde" },
    baja: { texto: "Baja", clase: "badge-rojo" },
    media: { texto: "Media", clase: "badge-amarillo" },
    alta: { texto: "Alta", clase: "badge-verde" },
    indeterminada: { texto: "Sin datos", clase: "badge-gris" }
};

function crearBadge(valor) {
    const conf = ETIQUETAS_ESTADO[valor] || ETIQUETAS_ESTADO["indeterminada"];
    const span = document.createElement("span");
    span.className = `badge ${conf.clase}`;
    span.textContent = conf.texto;
    return span;
}


/* Recomendaciones en base a los resultados */

function generarRecomendaciones(resultado, respuestas) {
    const recs = [];

    if (resultado.situacion_financiera === "critica") {
        recs.push("Consigue más capital antes de abrir: busca socios, inversores o considera un modelo de negocio con menor inversión inicial.");
    }
    if (resultado.situacion_financiera === "deficiente") {
        recs.push("Reduce los costos operativos iniciales: empieza pequeño, usa un modelo de negocio lean y valida la idea antes de escalar.");
    }
    if (resultado.posicion_mercado === "desfavorable") {
        recs.push("Redefine tu segmento de mercado o considera diferenciarte para crear tu propio nicho con menor competencia.");
    }
    if (respuestas.ubicacion === "mala") {
        recs.push("Considera cambiar de ubicación o migrar el modelo a digital para ampliar tu alcance de clientes.");
    }
    if (resultado.preparacion_empresarial === "baja") {
        recs.push("Elabora un plan de negocio formal y busca mentoría o capacitación en el sector antes de invertir.");
    }
    if (respuestas.experiencia === "ninguna") {
        recs.push("Trabaja primero en el sector o asóciate con alguien que tenga experiencia para reducir el riesgo operativo.");
    }
    if (respuestas.plan_negocio === "ninguno") {
        recs.push("Crea un plan de negocio con proyecciones financieras a 12 y 24 meses antes de comprometer capital.");
    }
    if (respuestas.diferenciador === "nada_diferenciada") {
        recs.push("Define un diferenciador claro. Entrar al mercado siendo exactamente igual a los demás te obligará a una guerra de precios insostenible.");
    }
    if (respuestas.dedicacion === "baja") {
        recs.push("Al delegar la operación desde el inicio, asegúrate de contratar a un gerente con experiencia comprobada y establecer controles financieros muy estrictos.");
    }
    if (respuestas.permisos === "ninguno") {
        recs.push("Detén cualquier inversión física hasta investigar los permisos y usos de suelo. Una clausura temprana puede quebrar el negocio definitivamente.");
    } else if (respuestas.permisos === "investigado") {
        recs.push("Inicia los trámites gubernamentales lo antes posible; los tiempos burocráticos suelen retrasar las aperturas y consumir tu capital de arranque.");
    }
    if (respuestas.seguridad === "insegura") {
        recs.push("La zona elegida es insegura. Considera fuertemente buscar otro lugar; la falta de seguridad aleja clientes y pone en riesgo tu patrimonio y equipo.");
    }
    if (respuestas.costo_local === "alto") {
        recs.push("El costo de renta proyectado es demasiado alto (más del 30%). Intenta renegociar el contrato o busca opciones más económicas para no asfixiar tus finanzas desde el día 1.");
    }
    if (respuestas.accesibilidad === "dificil") {
        recs.push("La accesibilidad del local es difícil. Si los clientes no pueden llegar o estacionarse cómodamente, elegirán a la competencia por conveniencia.");
    }
    if (respuestas.historial_local === "cierres_rapidos") {
        recs.push("El local tiene un historial de cierres constantes (un posible local 'salado'). Investiga detenidamente las causas de los fracasos anteriores antes de firmar.");
    }
    if (respuestas.marketing_presupuesto === "ninguno") {
        recs.push("Sin un presupuesto de marketing, será muy difícil atraer a tus primeros clientes. Define al menos estrategias locales o de bajo costo para dar a conocer tu negocio.");
    }
    if (respuestas.proveedores === "muy_dificil") {
        recs.push("El acceso difícil a proveedores puede romper tu cadena de suministro. Asegura múltiples opciones o contratos a largo plazo antes de iniciar.");
    }
    if (resultado.veredicto === "muy_viable") {
        recs.push("Define tus indicadores clave de desempeño (KPIs) y monitoréalos mensualmente para mantener el rumbo.");
        recs.push("Considera registrar formalmente el negocio y obtener asesoría fiscal desde el inicio.");
    }
    if (resultado.veredicto === "viable" && resultado.posicion_mercado === "muy_favorable") {
        recs.push("Actúa con agilidad: las oportunidades de mercado muy favorables pueden atraer competidores rápidamente.");
    }
    if (recs.length === 0) {
        recs.push("Valida tu idea con clientes reales antes de hacer la inversión completa.");
        recs.push("Define un cronograma de metas a 3, 6 y 12 meses para medir el progreso del negocio.");
    }

    return recs;
}


/* Mostrar resultados */

function mostrarResultados() {
    const resultado = evaluarViabilidad(estado.respuestas);
    estado.respuestas.capital = resultado.capital_evaluado;
    const score = calcularScore(estado.respuestas);

    // Sistema de seguridad: si las 13 reglas de veredicto no cubren la combinación exacta,
    // Usamos el score matemático como respaldo para garantizar un diagnóstico.
    if (resultado.veredicto === "indeterminado") {
        if (score >= 80) resultado.veredicto = "muy_viable";
        else if (score >= 60) resultado.veredicto = "viable";
        else if (score >= 40) resultado.veredicto = "riesgoso";
        else resultado.veredicto = "no_recomendable";
    }

    const conf = CONFIGURACION_VEREDICTO[resultado.veredicto] || CONFIGURACION_VEREDICTO.indeterminado;

    /* Conclusión */
    dom.tarjetaVeredicto.className = `tarjeta-veredicto ${conf.clase}`;
    dom.iconoVeredicto.innerHTML = conf.icono;
    dom.tituloVeredicto.textContent = conf.titulo;
    dom.descVeredicto.textContent = conf.descripcion;

    /* Score se resetea a 0 y se anima luego de que la sección es visible */
    dom.barraScore.style.width = "0%";
    dom.barraScore.className = `barra-score-relleno ${conf.clase}`;
    dom.numeroScore.textContent = "0";

    /* Badges de factores con descripciones en lenguaje natural */
    dom.estadoFinanciero.innerHTML = "";
    dom.estadoMercado.innerHTML = "";
    dom.estadoPreparacion.innerHTML = "";

    dom.estadoFinanciero.appendChild(crearBadge(resultado.situacion_financiera));
    dom.estadoMercado.appendChild(crearBadge(resultado.posicion_mercado));
    dom.estadoPreparacion.appendChild(crearBadge(resultado.preparacion_empresarial));

    dom.textoFinanciero.textContent = (DESCRIPCION_ESTADO.situacion_financiera[resultado.situacion_financiera] || "");
    dom.textoMercado.textContent = (DESCRIPCION_ESTADO.posicion_mercado[resultado.posicion_mercado] || "");
    dom.textoPreparacion.textContent = (DESCRIPCION_ESTADO.preparacion_empresarial[resultado.preparacion_empresarial] || "");

    /* Cadena de razonamiento — sin nombres de variables */
    dom.cadenaReglas.innerHTML = "";
    resultado.cadenaRazonamiento.forEach(paso => {
        const item = document.createElement("div");
        item.className = `regla-item regla-cat-${paso.categoria}`;
        item.innerHTML = `
            <span class="regla-id">${paso.regla}</span>
            <div class="regla-cuerpo">
                <span class="regla-desc">${paso.descripcion}</span>
                <span class="regla-resultado">
                    &#8594; <strong>${traducirHecho(paso.hecho)}</strong>: ${traducirValor(paso.valor)}
                </span>
            </div>
        `;
        dom.cadenaReglas.appendChild(item);
    });

    /* Recomendaciones */
    const recs = generarRecomendaciones(resultado, estado.respuestas);
    dom.listaRecomendaciones.innerHTML = "";
    recs.forEach(rec => {
        const li = document.createElement("li");
        li.textContent = rec;
        dom.listaRecomendaciones.appendChild(li);
    });

    /* Generar gráfica de radar */
    const canvasObj = document.getElementById('grafico-resultados');
    if (canvasObj) {
        const ctx = canvasObj.getContext('2d');
        if (graficoResultados) {
            graficoResultados.destroy();
        }

        let ptsFinanzas = ((PUNTAJES.capital[estado.respuestas.capital] || 0) + (PUNTAJES.costo_local[estado.respuestas.costo_local] || 0)) / 65 * 100;
        let ptsMercado = ((PUNTAJES.demanda[estado.respuestas.demanda] || 0) + (PUNTAJES.saturacion_zona[estado.respuestas.saturacion_zona] || 0) + (PUNTAJES.flujo_personas[estado.respuestas.flujo_personas] || 0) + (PUNTAJES.visibilidad[estado.respuestas.visibilidad] || 0) + (PUNTAJES.negocios_ancla[estado.respuestas.negocios_ancla] || 0) + (PUNTAJES.impacto_negativo[estado.respuestas.impacto_negativo] || 0) + (PUNTAJES.diferenciador[estado.respuestas.diferenciador] || 0) + (PUNTAJES.marketing_presupuesto[estado.respuestas.marketing_presupuesto] || 0)) / 120 * 100;
        let ptsPreparacion = ((PUNTAJES.experiencia[estado.respuestas.experiencia] || 0) + (PUNTAJES.plan_negocio[estado.respuestas.plan_negocio] || 0) + (PUNTAJES.dedicacion[estado.respuestas.dedicacion] || 0) + (PUNTAJES.permisos[estado.respuestas.permisos] || 0) + (PUNTAJES.proveedores[estado.respuestas.proveedores] || 0)) / 55 * 100;

        graficoResultados = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Finanzas', 'Mercado/Ubic.', 'Preparación'],
                datasets: [{
                    label: 'Puntaje (%)',
                    data: [Math.min(100, ptsFinanzas || 0), Math.min(100, ptsMercado || 0), Math.min(100, ptsPreparacion || 0)],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20 }
                    }
                }
            }
        });
    }

    mostrarSeccion("resultados");

    /* Animar la barra y el contador después de que la sección sea visible */
    setTimeout(() => {
        dom.barraScore.style.width = score + "%";
        animarContador(dom.numeroScore, 0, score, 1200);
    }, 100);
}


/* Utilidades */

function animarContador(elemento, desde, hasta, duracion) {
    const inicio = performance.now();
    const rango = hasta - desde;

    function paso(t) {
        const progreso = Math.min((t - inicio) / duracion, 1);
        const easeOut = 1 - Math.pow(1 - progreso, 3);
        elemento.textContent = Math.round(desde + rango * easeOut);
        if (progreso < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
}


/* Inicialización */

function inicializar() {
    dom.totalPreguntas.textContent = PREGUNTAS_ACTIVAS.length;

    dom.btnIniciar.addEventListener("click", () => {
        estado.preguntaActual = 0;
        estado.respuestas = {};
        renderizarPregunta(0);
        mostrarSeccion("quiz");
    });

    dom.btnSiguiente.addEventListener("click", () => {
        if (estado.preguntaActual < PREGUNTAS_ACTIVAS.length - 1) {
            estado.preguntaActual++;
            renderizarPregunta(estado.preguntaActual);
        } else {
            mostrarResultados();
        }
    });

    dom.btnAnterior.addEventListener("click", () => {
        if (estado.preguntaActual > 0) {
            estado.preguntaActual--;
            renderizarPregunta(estado.preguntaActual);
        }
    });

    dom.btnReiniciar.addEventListener("click", () => {
        estado.preguntaActual = 0;
        estado.respuestas = {};
        mostrarSeccion("landing");
    });

    dom.btnImprimir.addEventListener("click", () => {
        window.print();
    });
}

document.addEventListener("DOMContentLoaded", inicializar);
