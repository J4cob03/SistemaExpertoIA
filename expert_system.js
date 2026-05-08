/**
 * expert_system.js
 *
 * Motor de inferencia para el sistema experto de viabilidad empresarial.
 * Implementa forwards chaining sobre una base de conocimiento de reglas
 * en formato IF-THEN.
 *
 * Arquitectura:
 *   - BASE_CONOCIMIENTO : coleccion de reglas de produccion
 *   - MemoriaTrabajo    : almacena los hechos actuales del problema
 *   - MotorInferencia   : ciclo de reconocimiento y disparo de reglas
 *
 * Hechos de entrada (escritos por el usuario):
 *   capital, competencia, ubicacion, demanda, costos, experiencia, plan_negocio
 *
 * Hechos derivados intermedios:
 *   situacion_financiera  -> critica | deficiente | aceptable | solida
 *   mercado_base          -> desfavorable | neutral | favorable | muy_favorable
 *   posicion_mercado      -> desfavorable | neutral | favorable | muy_favorable
 *   preparacion_empresarial -> baja | media | alta
 *
 * Hecho de salida:
 *   veredicto -> no_recomendable | riesgoso | viable | muy_viable
 *
 * Nota sobre el diseño:
 *   Se usa mercado_base (demanda + competencia) como hecho intermedio antes de
 *   derivar posicion_mercado (definido por ubicacion). Esto evita que el motor
 *   deba sobreescribir hechos ya establecidos.
 */

"use strict";

/* ==========================================================================
   BASE DE CONOCIMIENTO
   Reglas de produccion con estructura:
     id          -> identificador unico de la regla
     descripcion -> explicacion legible del razonamiento
     condiciones -> lista de antecedentes { hecho, operador, valor }
     accion      -> consecuente { hecho, valor } que se agrega a la memoria
     categoria   -> grupo tematico de la regla
   ========================================================================== */

const BASE_CONOCIMIENTO = [

    /* Determinación de la situacion financiera
       Deriva situacion_financiera a partir de capital y costos.
    */
    {
        id: "R001",
        descripcion: "Capital muy bajo implica situacion financiera critica sin importar los costos",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "muy_bajo" }
        ],
        accion: { hecho: "situacion_financiera", valor: "critica" },
        categoria: "financiero"
    },
    {
        id: "R002",
        descripcion: "Capital bajo con costos muy altos genera situacion financiera critica",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "bajo" },
            { hecho: "costos", operador: "igual", valor: "muy_altos" }
        ],
        accion: { hecho: "situacion_financiera", valor: "critica" },
        categoria: "financiero"
    },
    {
        id: "R003",
        descripcion: "Capital bajo con costos altos genera situacion financiera deficiente",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "bajo" },
            { hecho: "costos", operador: "igual", valor: "altos" }
        ],
        accion: { hecho: "situacion_financiera", valor: "deficiente" },
        categoria: "financiero"
    },
    {
        id: "R004",
        descripcion: "Capital bajo con costos moderados genera situacion financiera deficiente",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "bajo" },
            { hecho: "costos", operador: "igual", valor: "moderados" }
        ],
        accion: { hecho: "situacion_financiera", valor: "deficiente" },
        categoria: "financiero"
    },
    {
        id: "R005",
        descripcion: "Capital bajo con costos bajos da una situacion financiera aceptable",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "bajo" },
            { hecho: "costos", operador: "igual", valor: "bajos" }
        ],
        accion: { hecho: "situacion_financiera", valor: "aceptable" },
        categoria: "financiero"
    },
    {
        id: "R006",
        descripcion: "Capital moderado con costos muy altos produce situacion financiera deficiente",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "moderado" },
            { hecho: "costos", operador: "igual", valor: "muy_altos" }
        ],
        accion: { hecho: "situacion_financiera", valor: "deficiente" },
        categoria: "financiero"
    },
    {
        id: "R007",
        descripcion: "Capital moderado con costos altos produce situacion financiera aceptable",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "moderado" },
            { hecho: "costos", operador: "igual", valor: "altos" }
        ],
        accion: { hecho: "situacion_financiera", valor: "aceptable" },
        categoria: "financiero"
    },
    {
        id: "R008",
        descripcion: "Capital moderado con costos moderados o bajos produce situacion financiera solida",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "moderado" },
            { hecho: "costos", operador: "en", valor: ["moderados", "bajos"] }
        ],
        accion: { hecho: "situacion_financiera", valor: "solida" },
        categoria: "financiero"
    },
    {
        id: "R009",
        descripcion: "Capital alto garantiza situacion financiera solida independientemente de los costos",
        condiciones: [
            { hecho: "capital", operador: "igual", valor: "alto" }
        ],
        accion: { hecho: "situacion_financiera", valor: "solida" },
        categoria: "financiero"
    },

    /* 
       Determinación de la base de mercado
       Deriva mercado_base a partir de demanda y competencia solamente.
    */
    {
        id: "R010",
        descripcion: "Baja demanda da una base de mercado desfavorable sin importar la competencia",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "baja" }
        ],
        accion: { hecho: "mercado_base", valor: "desfavorable" },
        categoria: "mercado"
    },
    {
        id: "R011",
        descripcion: "Demanda media con alta competencia da una base de mercado desfavorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "media" },
            { hecho: "competencia", operador: "igual", valor: "alta" }
        ],
        accion: { hecho: "mercado_base", valor: "desfavorable" },
        categoria: "mercado"
    },
    {
        id: "R012",
        descripcion: "Demanda media con competencia media da una base de mercado neutral",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "media" },
            { hecho: "competencia", operador: "igual", valor: "media" }
        ],
        accion: { hecho: "mercado_base", valor: "neutral" },
        categoria: "mercado"
    },
    {
        id: "R013",
        descripcion: "Demanda media con baja competencia da una base de mercado favorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "media" },
            { hecho: "competencia", operador: "igual", valor: "baja" }
        ],
        accion: { hecho: "mercado_base", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R014",
        descripcion: "Alta demanda con alta competencia da una base de mercado neutral",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "alta" },
            { hecho: "competencia", operador: "igual", valor: "alta" }
        ],
        accion: { hecho: "mercado_base", valor: "neutral" },
        categoria: "mercado"
    },
    {
        id: "R015",
        descripcion: "Alta demanda con competencia media da una base de mercado favorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "alta" },
            { hecho: "competencia", operador: "igual", valor: "media" }
        ],
        accion: { hecho: "mercado_base", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R016",
        descripcion: "Alta demanda con baja competencia es una oportunidad de base de mercado muy favorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "alta" },
            { hecho: "competencia", operador: "igual", valor: "baja" }
        ],
        accion: { hecho: "mercado_base", valor: "muy_favorable" },
        categoria: "mercado"
    },
    {
        id: "R017",
        descripcion: "Demanda muy alta con alta competencia da una base de mercado favorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "muy_alta" },
            { hecho: "competencia", operador: "igual", valor: "alta" }
        ],
        accion: { hecho: "mercado_base", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R018",
        descripcion: "Demanda muy alta con competencia media o baja da una base de mercado muy favorable",
        condiciones: [
            { hecho: "demanda", operador: "igual", valor: "muy_alta" },
            { hecho: "competencia", operador: "en", valor: ["media", "baja"] }
        ],
        accion: { hecho: "mercado_base", valor: "muy_favorable" },
        categoria: "mercado"
    },

    /*
       Ajuste de posicion en mercado por ubicacion
       Combina mercado_base con ubicacion para derivar posicion_mercado.
    */
    {
        id: "R019",
        descripcion: "Base desfavorable permanece desfavorable independientemente de la ubicacion",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "desfavorable" }
        ],
        accion: { hecho: "posicion_mercado", valor: "desfavorable" },
        categoria: "mercado"
    },
    {
        id: "R020",
        descripcion: "Base neutral con ubicacion excelente mejora la posicion de mercado a favorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "neutral" },
            { hecho: "ubicacion", operador: "igual", valor: "excelente" }
        ],
        accion: { hecho: "posicion_mercado", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R021",
        descripcion: "Base neutral con ubicacion mala degrada la posicion de mercado a desfavorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "neutral" },
            { hecho: "ubicacion", operador: "igual", valor: "mala" }
        ],
        accion: { hecho: "posicion_mercado", valor: "desfavorable" },
        categoria: "mercado"
    },
    {
        id: "R022",
        descripcion: "Base neutral con ubicacion regular o buena mantiene posicion de mercado neutral",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "neutral" },
            { hecho: "ubicacion", operador: "en", valor: ["regular", "buena"] }
        ],
        accion: { hecho: "posicion_mercado", valor: "neutral" },
        categoria: "mercado"
    },
    {
        id: "R023",
        descripcion: "Base favorable con ubicacion excelente mejora la posicion de mercado a muy favorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "favorable" },
            { hecho: "ubicacion", operador: "igual", valor: "excelente" }
        ],
        accion: { hecho: "posicion_mercado", valor: "muy_favorable" },
        categoria: "mercado"
    },
    {
        id: "R024",
        descripcion: "Base favorable con ubicacion mala degrada la posicion de mercado a neutral",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "favorable" },
            { hecho: "ubicacion", operador: "igual", valor: "mala" }
        ],
        accion: { hecho: "posicion_mercado", valor: "neutral" },
        categoria: "mercado"
    },
    {
        id: "R025",
        descripcion: "Base favorable con ubicacion regular o buena mantiene posicion de mercado favorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "favorable" },
            { hecho: "ubicacion", operador: "en", valor: ["regular", "buena"] }
        ],
        accion: { hecho: "posicion_mercado", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R026",
        descripcion: "Base muy favorable con ubicacion mala degrada la posicion de mercado a favorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "muy_favorable" },
            { hecho: "ubicacion", operador: "igual", valor: "mala" }
        ],
        accion: { hecho: "posicion_mercado", valor: "favorable" },
        categoria: "mercado"
    },
    {
        id: "R027",
        descripcion: "Base muy favorable con ubicacion regular o mejor mantiene posicion de mercado muy favorable",
        condiciones: [
            { hecho: "mercado_base", operador: "igual", valor: "muy_favorable" },
            { hecho: "ubicacion", operador: "en", valor: ["regular", "buena", "excelente"] }
        ],
        accion: { hecho: "posicion_mercado", valor: "muy_favorable" },
        categoria: "mercado"
    },

    /* 
       Determinación de la preparacion empresarial
       Combina experiencia en el sector con disponibilidad de plan de negocio.
    */
    {
        id: "R028",
        descripcion: "Sin experiencia y sin plan de negocio da preparacion empresarial baja",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "ninguna" },
            { hecho: "plan_negocio", operador: "igual", valor: "ninguno" }
        ],
        accion: { hecho: "preparacion_base", valor: "baja" },
        categoria: "preparacion"
    },
    {
        id: "R029",
        descripcion: "Sin experiencia pero con algun plan de negocio da preparacion empresarial media",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "ninguna" },
            { hecho: "plan_negocio", operador: "en", valor: ["basico", "completo"] }
        ],
        accion: { hecho: "preparacion_base", valor: "media" },
        categoria: "preparacion"
    },
    {
        id: "R030",
        descripcion: "Poca experiencia sin plan de negocio da preparacion empresarial baja",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "poca" },
            { hecho: "plan_negocio", operador: "igual", valor: "ninguno" }
        ],
        accion: { hecho: "preparacion_base", valor: "baja" },
        categoria: "preparacion"
    },
    {
        id: "R031",
        descripcion: "Poca experiencia con plan basico da preparacion empresarial media",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "poca" },
            { hecho: "plan_negocio", operador: "igual", valor: "basico" }
        ],
        accion: { hecho: "preparacion_base", valor: "media" },
        categoria: "preparacion"
    },
    {
        id: "R032",
        descripcion: "Poca experiencia con plan completo da preparacion empresarial alta",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "poca" },
            { hecho: "plan_negocio", operador: "igual", valor: "completo" }
        ],
        accion: { hecho: "preparacion_base", valor: "alta" },
        categoria: "preparacion"
    },
    {
        id: "R033",
        descripcion: "Experiencia moderada sin plan de negocio da preparacion empresarial media",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "moderada" },
            { hecho: "plan_negocio", operador: "igual", valor: "ninguno" }
        ],
        accion: { hecho: "preparacion_base", valor: "media" },
        categoria: "preparacion"
    },
    {
        id: "R034",
        descripcion: "Experiencia moderada con cualquier plan da preparacion empresarial alta",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "moderada" },
            { hecho: "plan_negocio", operador: "en", valor: ["basico", "completo"] }
        ],
        accion: { hecho: "preparacion_base", valor: "alta" },
        categoria: "preparacion"
    },
    {
        id: "R035",
        descripcion: "Amplia experiencia garantiza preparacion empresarial alta sin importar el plan",
        condiciones: [
            { hecho: "experiencia", operador: "igual", valor: "amplia" }
        ],
        accion: { hecho: "preparacion_base", valor: "alta" },
        categoria: "preparacion"
    },

    /* 
       Determinación del veredicto final
       Combina situacion_financiera, posicion_mercado y preparacion_empresarial.
       Ordenadas de la condición mas restrictiva a la más favorable
       para garantizar que la primera que coincida sea la correcta.
    */
    {
        id: "R036",
        descripcion: "Situacion financiera critica hace inviable cualquier proyecto empresarial",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "critica" }
        ],
        accion: { hecho: "veredicto", valor: "no_recomendable" },
        categoria: "veredicto"
    },
    {
        id: "R037",
        descripcion: "Mercado desfavorable con finanzas deficientes produce veredicto no recomendable",
        condiciones: [
            { hecho: "posicion_mercado", operador: "igual", valor: "desfavorable" },
            { hecho: "situacion_financiera", operador: "igual", valor: "deficiente" }
        ],
        accion: { hecho: "veredicto", valor: "no_recomendable" },
        categoria: "veredicto"
    },
    {
        id: "R038",
        descripcion: "Mercado desfavorable con preparacion baja produce veredicto no recomendable",
        condiciones: [
            { hecho: "posicion_mercado", operador: "igual", valor: "desfavorable" },
            { hecho: "preparacion_empresarial", operador: "igual", valor: "baja" }
        ],
        accion: { hecho: "veredicto", valor: "no_recomendable" },
        categoria: "veredicto"
    },
    {
        id: "R039",
        descripcion: "Mercado desfavorable con finanzas aceptables o solidas produce veredicto riesgoso",
        condiciones: [
            { hecho: "posicion_mercado", operador: "igual", valor: "desfavorable" },
            { hecho: "situacion_financiera", operador: "en", valor: ["aceptable", "solida"] }
        ],
        accion: { hecho: "veredicto", valor: "riesgoso" },
        categoria: "veredicto"
    },
    {
        id: "R040",
        descripcion: "Finanzas deficientes con mercado neutral produce veredicto riesgoso",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "deficiente" },
            { hecho: "posicion_mercado", operador: "igual", valor: "neutral" }
        ],
        accion: { hecho: "veredicto", valor: "riesgoso" },
        categoria: "veredicto"
    },
    {
        id: "R041",
        descripcion: "Finanzas deficientes con mercado favorable o muy favorable produce veredicto riesgoso",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "deficiente" },
            { hecho: "posicion_mercado", operador: "en", valor: ["favorable", "muy_favorable"] }
        ],
        accion: { hecho: "veredicto", valor: "riesgoso" },
        categoria: "veredicto"
    },
    {
        id: "R042",
        descripcion: "Finanzas aceptables con mercado neutral produce veredicto riesgoso",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "aceptable" },
            { hecho: "posicion_mercado", operador: "igual", valor: "neutral" }
        ],
        accion: { hecho: "veredicto", valor: "riesgoso" },
        categoria: "veredicto"
    },
    {
        id: "R043",
        descripcion: "Finanzas aceptables con mercado favorable produce veredicto viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "aceptable" },
            { hecho: "posicion_mercado", operador: "igual", valor: "favorable" }
        ],
        accion: { hecho: "veredicto", valor: "viable" },
        categoria: "veredicto"
    },
    {
        id: "R044",
        descripcion: "Finanzas aceptables con mercado muy favorable produce veredicto viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "aceptable" },
            { hecho: "posicion_mercado", operador: "igual", valor: "muy_favorable" }
        ],
        accion: { hecho: "veredicto", valor: "viable" },
        categoria: "veredicto"
    },
    {
        id: "R045",
        descripcion: "Finanzas solidas con mercado neutral produce veredicto viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "solida" },
            { hecho: "posicion_mercado", operador: "igual", valor: "neutral" }
        ],
        accion: { hecho: "veredicto", valor: "viable" },
        categoria: "veredicto"
    },
    {
        id: "R046",
        descripcion: "Finanzas solidas con mercado favorable produce veredicto viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "solida" },
            { hecho: "posicion_mercado", operador: "igual", valor: "favorable" }
        ],
        accion: { hecho: "veredicto", valor: "viable" },
        categoria: "veredicto"
    },
    {
        id: "R047",
        descripcion: "Finanzas solidas con mercado muy favorable y preparacion alta produce veredicto muy viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "solida" },
            { hecho: "posicion_mercado", operador: "igual", valor: "muy_favorable" },
            { hecho: "preparacion_empresarial", operador: "igual", valor: "alta" }
        ],
        accion: { hecho: "veredicto", valor: "muy_viable" },
        categoria: "veredicto"
    },
    {
        id: "R048",
        descripcion: "Finanzas solidas con mercado muy favorable y preparacion no alta produce veredicto viable",
        condiciones: [
            { hecho: "situacion_financiera", operador: "igual", valor: "solida" },
            { hecho: "posicion_mercado", operador: "igual", valor: "muy_favorable" },
            { hecho: "preparacion_empresarial", operador: "en", valor: ["media", "baja"] }
        ],
        accion: { hecho: "veredicto", valor: "viable" },
        categoria: "veredicto"
    }
];

/* Reglas genereradas dinámicamente para el capital */
(function generarReglasCapital() {
    let idCounter = 100;

    const ZONAS = {
        zona_local:         { label: "zona local",          mult: 1.0  },
        ciudad_media:       { label: "ciudad mediana",      mult: 1.25 },
        zona_metropolitana: { label: "zona metropolitana",  mult: 1.6  }
    };

    function tamanLabel(size) {
        const map = { pequeno: "local pequeño", mediano: "local mediano", grande: "local grande" };
        return map[size] || size;
    }

    function addRulesForZone(types, baseRanges, zona, mult) {
        for (const [size, ranges] of Object.entries(baseRanges)) {
            const [low, med, high] = ranges.map(v => Math.round(v * mult));
            const opType = Array.isArray(types) ? "en" : "igual";
            const zLabel = ZONAS[zona].label;
            const tLabel = tamanLabel(size);

            BASE_CONOCIMIENTO.push({
                id: `R${idCounter++}`,
                descripcion: `El capital es insuficiente para arrancar este tipo de negocio en ${tLabel} en ${zLabel}`,
                condiciones: [
                    { hecho: "tipo_negocio", operador: opType, valor: types },
                    { hecho: "tamano_local", operador: "igual", valor: size },
                    { hecho: "zona_economica", operador: "igual", valor: zona },
                    { hecho: "capital_numerico", operador: "menor_que", valor: low }
                ],
                accion: { hecho: "capital", valor: "muy_bajo" },
                categoria: "financiero"
            });

            BASE_CONOCIMIENTO.push({
                id: `R${idCounter++}`,
                descripcion: `El capital cubre lo mínimo pero sigue siendo bajo para este tipo de negocio en ${tLabel} en ${zLabel}`,
                condiciones: [
                    { hecho: "tipo_negocio", operador: opType, valor: types },
                    { hecho: "tamano_local", operador: "igual", valor: size },
                    { hecho: "zona_economica", operador: "igual", valor: zona },
                    { hecho: "capital_numerico", operador: "mayor_o_igual", valor: low },
                    { hecho: "capital_numerico", operador: "menor_que", valor: med }
                ],
                accion: { hecho: "capital", valor: "bajo" },
                categoria: "financiero"
            });

            BASE_CONOCIMIENTO.push({
                id: `R${idCounter++}`,
                descripcion: `El capital disponible es moderado para este tipo de negocio en ${tLabel} en ${zLabel}`,
                condiciones: [
                    { hecho: "tipo_negocio", operador: opType, valor: types },
                    { hecho: "tamano_local", operador: "igual", valor: size },
                    { hecho: "zona_economica", operador: "igual", valor: zona },
                    { hecho: "capital_numerico", operador: "mayor_o_igual", valor: med },
                    { hecho: "capital_numerico", operador: "menor_que", valor: high }
                ],
                accion: { hecho: "capital", valor: "moderado" },
                categoria: "financiero"
            });

            BASE_CONOCIMIENTO.push({
                id: `R${idCounter++}`,
                descripcion: `El capital es sólido y suficiente para este tipo de negocio en ${tLabel} en ${zLabel}`,
                condiciones: [
                    { hecho: "tipo_negocio", operador: opType, valor: types },
                    { hecho: "tamano_local", operador: "igual", valor: size },
                    { hecho: "zona_economica", operador: "igual", valor: zona },
                    { hecho: "capital_numerico", operador: "mayor_o_igual", valor: high }
                ],
                accion: { hecho: "capital", valor: "alto" },
                categoria: "financiero"
            });
        }
    }

    const BASE_RANGES = {
        comida_entretenimiento: {
            pequeno: [150000, 300000, 600000],
            mediano: [400000, 800000, 1600000],
            grande:  [1000000, 2000000, 4000000]
        },
        comercio_salud: {
            pequeno: [75000, 150000, 300000],
            mediano: [200000, 400000, 800000],
            grande:  [500000, 1000000, 2000000]
        },
        basico_servicios: {
            pequeno: [25000, 50000, 100000],
            mediano: [75000, 150000, 300000],
            grande:  [250000, 500000, 1000000]
        },
        manufactura_logistica: {
            pequeno: [200000, 400000, 800000],
            mediano: [500000, 1000000, 2000000],
            grande:  [1500000, 3000000, 6000000]
        }
    };

    const TIPOS_NEGOCIO = [
        { types: ["comida_bebida", "entretenimiento_ocio"],                                                        ranges: BASE_RANGES.comida_entretenimiento },
        { types: ["comercio_productos", "salud_bienestar"],                                                        ranges: BASE_RANGES.comercio_salud         },
        { types: ["comercio_basico", "servicios_profesionales", "tecnologia_digital", "educacion_capacitacion"],  ranges: BASE_RANGES.basico_servicios       },
        { types: ["manufactura_produccion", "logistica_transporte"],                                               ranges: BASE_RANGES.manufactura_logistica  }
    ];

    for (const zona of Object.keys(ZONAS)) {
        const mult = ZONAS[zona].mult;
        for (const grupo of TIPOS_NEGOCIO) {
            addRulesForZone(grupo.types, grupo.ranges, zona, mult);
        }
    }
})();

/* Reglas generadas dinámicamente para preparación y mercado  */
(function generarReglasAvanzadas() {
    let id = 300;

    // Reglas para Preparación Empresarial Final (preparacion_base + dedicacion + permisos)
    const prepBases = ["baja", "media", "alta"];
    const dedicaciones = ["baja", "media", "alta"];

    const labelPrep = { baja: "baja", media: "media", alta: "alta" };
    const labelDed  = { baja: "mínima (operado por terceros)", media: "parcial (medio tiempo)", alta: "completa (tiempo completo)" };

    for (const pb of prepBases) {
        for (const ded of dedicaciones) {
            let finalPrep = pb;
            if (ded === "baja" && pb !== "alta") finalPrep = "baja";
            if (ded === "alta" && pb === "media") finalPrep = "alta";

            BASE_CONOCIMIENTO.push({
                id: `R${id++}`,
                descripcion: `Con preparación ${labelPrep[pb]} y dedicación ${labelDed[ded]}, la preparación preliminar queda en nivel ${labelPrep[finalPrep]}`,
                condiciones: [
                    { hecho: "preparacion_base", operador: "igual", valor: pb },
                    { hecho: "dedicacion", operador: "igual", valor: ded }
                ],
                accion: { hecho: "preparacion_empresarial_temp", valor: finalPrep },
                categoria: "preparacion"
            });
        }
    }

    const tempPreps = ["baja", "media", "alta"];
    const permisosVals = ["ninguno", "investigado", "tramite"];

    const labelPermisos = { ninguno: "sin permisos investigados", investigado: "con permisos identificados", tramite: "con permisos en trámite o aprobados" };

    for (const tp of tempPreps) {
        for (const perm of permisosVals) {
            let final = tp;
            if (perm === "ninguno" && tp === "alta") final = "media";
            if (perm === "tramite" && tp === "media") final = "alta";

            BASE_CONOCIMIENTO.push({
                id: `R${id++}`,
                descripcion: `Con preparación preliminar ${labelPrep[tp]} ${labelPermisos[perm]}, la preparación empresarial final es ${labelPrep[final]}`,
                condiciones: [
                    { hecho: "preparacion_empresarial_temp", operador: "igual", valor: tp },
                    { hecho: "permisos", operador: "igual", valor: perm }
                ],
                accion: { hecho: "preparacion_empresarial", valor: final },
                categoria: "preparacion"
            });
        }
    }

    // Regla para Diferenciador que afecta al mercado favorable
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Una propuesta diferenciada impulsa la posición de mercado de neutral a favorable",
        condiciones: [
            { hecho: "posicion_mercado", operador: "igual", valor: "neutral" },
            { hecho: "diferenciador", operador: "en", valor: ["muy_diferenciada", "diferenciada"] }
        ],
        accion: { hecho: "posicion_mercado", valor: "favorable" },
        categoria: "mercado"
    });

    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Una propuesta diferenciada modera el riesgo y mejora la posición de mercado a neutral",
        condiciones: [
            { hecho: "posicion_mercado", operador: "igual", valor: "riesgoso" },
            { hecho: "diferenciador", operador: "en", valor: ["muy_diferenciada", "diferenciada"] }
        ],
        accion: { hecho: "posicion_mercado", valor: "neutral" },
        categoria: "mercado"
    });
})();

(function generarReglasUbicacion() {
    let id = 400;

    // Regla de excelente ubicación (más específica, debe evaluarse antes que las base)
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Ubicación excelente (alto flujo, buena visibilidad, muy accesible)",
        condiciones: [
            { hecho: "flujo_personas", operador: "en", valor: ["alto_constante", "alto_rapido"] },
            { hecho: "visibilidad", operador: "en", valor: ["total", "bastante"] },
            { hecho: "accesibilidad", operador: "en", valor: ["muy_accesible", "accesible"] },
            { hecho: "seguridad", operador: "en", valor: ["muy_segura", "segura"] },
            { hecho: "impacto_negativo", operador: "en", valor: ["no_impacto", "minimo"] },
            { hecho: "historial_local", operador: "en", valor: ["estable", "cambios_leves"] }
        ],
        accion: { hecho: "ubicacion", valor: "excelente" },
        categoria: "ubicacion_deducida"
    });

    // Reglas de mala ubicación
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Si el local es inaccesible, la ubicación es mala",
        condiciones: [ { hecho: "accesibilidad", operador: "igual", valor: "dificil" } ],
        accion: { hecho: "ubicacion", valor: "mala" },
        categoria: "ubicacion_deducida"
    });
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Si el entorno es inseguro, la ubicación es mala",
        condiciones: [ { hecho: "seguridad", operador: "igual", valor: "insegura" } ],
        accion: { hecho: "ubicacion", valor: "mala" },
        categoria: "ubicacion_deducida"
    });
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Si hay alto impacto negativo, la ubicación es mala",
        condiciones: [ { hecho: "impacto_negativo", operador: "igual", valor: "alto_impacto" } ],
        accion: { hecho: "ubicacion", valor: "mala" },
        categoria: "ubicacion_deducida"
    });
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Si hay historial de cierres rápidos, la ubicación es mala",
        condiciones: [ { hecho: "historial_local", operador: "igual", valor: "cierres_rapidos" } ],
        accion: { hecho: "ubicacion", valor: "mala" },
        categoria: "ubicacion_deducida"
    });
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Si el flujo es bajo y está oculto, la ubicación es mala",
        condiciones: [
            { hecho: "flujo_personas", operador: "igual", valor: "bajo" },
            { hecho: "visibilidad", operador: "igual", valor: "oculto" }
        ],
        accion: { hecho: "ubicacion", valor: "mala" },
        categoria: "ubicacion_deducida"
    });

    // Reglas base / defecto (se evalúan al final, solo si ninguna regla específica ya fijó ubicacion)
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Ubicación buena por defecto si el flujo es alto",
        condiciones: [
            { hecho: "flujo_personas", operador: "en", valor: ["alto_constante", "alto_rapido"] }
        ],
        accion: { hecho: "ubicacion", valor: "buena" },
        categoria: "ubicacion_deducida"
    });
    BASE_CONOCIMIENTO.push({
        id: `R${id++}`,
        descripcion: "Ubicación base es regular si el flujo es bajo/moderado",
        condiciones: [
            { hecho: "flujo_personas", operador: "en", valor: ["bajo", "moderado"] }
        ],
        accion: { hecho: "ubicacion", valor: "regular" },
        categoria: "ubicacion_deducida"
    });
})();

(function generarReglasTraduccion() {
    let id = 500;
    // Traducir saturacion_zona a competencia
    const mapCompetencia = { "muy_baja": "baja", "baja": "baja", "moderada": "media", "alta": "alta" };
    const labelSat  = { "muy_baja": "muy baja", "baja": "baja", "moderada": "moderada", "alta": "alta" };
    const labelComp = { "baja": "baja", "media": "media", "alta": "alta" };

    for (const [sat, comp] of Object.entries(mapCompetencia)) {
        BASE_CONOCIMIENTO.push({
            id: `R${id++}`,
            descripcion: `Con saturación de negocios similares ${labelSat[sat]}, el nivel de competencia en la zona es ${labelComp[comp]}`,
            condiciones: [ { hecho: "saturacion_zona", operador: "igual", valor: sat } ],
            accion: { hecho: "competencia", valor: comp },
            categoria: "traduccion"
        });
    }

    // Traducir costo_local a costos
    const mapCostos = { "sin_costo": "bajos", "bajo": "bajos", "moderado": "moderados", "alto": "muy_altos" };
    const labelCL = { "sin_costo": "sin costo de renta", "bajo": "bajo", "moderado": "moderado", "alto": "alto" };
    const labelCO = { "bajos": "bajos", "moderados": "moderados", "muy_altos": "muy altos" };

    for (const [cost, costs] of Object.entries(mapCostos)) {
        BASE_CONOCIMIENTO.push({
            id: `R${id++}`,
            descripcion: `El costo del local es ${labelCL[cost]}, lo que representa una carga operativa ${labelCO[costs]}`,
            condiciones: [ { hecho: "costo_local", operador: "igual", valor: cost } ],
            accion: { hecho: "costos", valor: costs },
            categoria: "traduccion"
        });
    }
})();


/* Almacenamiento de todos los hechos conocidos */

class MemoriaTrabajo {
    constructor() {
        this.hechos = {};
    }

    /**
     * Agrega un hecho a la memoria. No sobreescribe hechos ya existentes
     */
    establecer(hecho, valor) {
        this.hechos[hecho] = valor;
    }

    /**
     * Retorna el valor de un hecho o undefined si no existe.
     */
    obtener(hecho) {
        return this.hechos[hecho];
    }

    /**
     * Indica si un hecho ya fue establecido en la memoria.
     */
    contiene(hecho) {
        return hecho in this.hechos;
    }

    /**
     * Retorna una copia inmutable del estado completo de la memoria.
     */
    obtenerTodo() {
        return { ...this.hechos };
    }
}


/* ==========================================================================
   MOTOR DE INFERENCIA
   Implementa el ciclo de reconocimiento-seleccion-disparo del
   algoritmo de forward chaining.

   Ciclo:
     1. Reconocimiento : identificar reglas cuyas condiciones se cumplen
     2. Seleccion      : tomar la primera regla aplicable 
     3. Disparo        : ejecutar la accion y agregar el hecho a la memoria
     4. Repetir        : continuar hasta que no queden reglas aplicables
   ========================================================================== */

class MotorInferencia {

    /**
     * @param {Array}          baseConocimiento - Reglas de produccion a evaluar
     * @param {MemoriaTrabajo}  memoriaTrabajo   - Hechos iniciales del problema
     */
    constructor(baseConocimiento, memoriaTrabajo) {
        this.base               = baseConocimiento;
        this.memoria            = memoriaTrabajo;
        this.reglasFijadas      = [];
        this.cadenaRazonamiento = [];
    }

    /**
     * Verifica si todas las condiciones de una regla son satisfechas
     * por los hechos actuales de la memoria de trabajo.
     *
     * @param  {Array}   condiciones - Lista de antecedentes de la regla
     * @return {boolean} true si todos los antecedentes se cumplen
     */
    _evaluarCondiciones(condiciones) {
        return condiciones.every(cond => {
            const valorActual = this.memoria.obtener(cond.hecho);
            if (valorActual === undefined) return false;

            switch (cond.operador) {
                case "igual":
                    return valorActual === cond.valor;
                case "en":
                    return Array.isArray(cond.valor) && cond.valor.includes(valorActual);
                case "verdadero":
                    return valorActual === true;
                case "mayor_que":
                    return Number(valorActual) > Number(cond.valor);
                case "menor_que":
                    return Number(valorActual) < Number(cond.valor);
                case "mayor_o_igual":
                    return Number(valorActual) >= Number(cond.valor);
                case "menor_o_igual":
                    return Number(valorActual) <= Number(cond.valor);
                default:
                    return false;
            }
        });
    }

    /**
     * Ejecuta el ciclo de inferencia hasta que no haya mas reglas aplicables.
     * Cada iteracion del ciclo externo es un paso de razonamiento completo.
     *
     * @return {boolean} true si se alcanzo un veredicto, false si la base
     *                   de conocimiento es insuficiente para el problema dado
     */
    ejecutar() {
        let huboCambio = true;

        while (huboCambio) {
            huboCambio = false;

            for (const regla of this.base) {

                /* Omitir reglas ya disparadas en iteraciones anteriores */
                if (this.reglasFijadas.includes(regla.id)) continue;

                /* Omitir reglas cuyo consecuente ya fue derivado previamente */
                if (this.memoria.contiene(regla.accion.hecho)) continue;

                /* Evaluar todos los antecedentes de la regla */
                if (this._evaluarCondiciones(regla.condiciones)) {
                    this.memoria.establecer(regla.accion.hecho, regla.accion.valor);
                    this.reglasFijadas.push(regla.id);
                    this.cadenaRazonamiento.push({
                        regla:       regla.id,
                        descripcion: regla.descripcion,
                        hecho:       regla.accion.hecho,
                        valor:       regla.accion.valor,
                        categoria:   regla.categoria
                    });
                    huboCambio = true;
                }
            }
        }

        return this.memoria.contiene("veredicto");
    }

    /**
     * Retorna la secuencia de reglas disparadas durante la inferencia.
     */
    obtenerCadenaRazonamiento() {
        return [...this.cadenaRazonamiento];
    }
}


/* Función de evaluación */

/**
 * Evalua la viabilidad empresarial a partir de las respuestas del usuario.
 *
 * @param  {Object} respuestas 
 * @return {Object} 
 */
function evaluarViabilidad(respuestas) {
    const memoria = new MemoriaTrabajo();

    /* Cargar hechos iniciales desde las respuestas del usuario */
    for (const [hecho, valor] of Object.entries(respuestas)) {
        memoria.establecer(hecho, valor);
    }

    const motor = new MotorInferencia(BASE_CONOCIMIENTO, memoria);
    motor.ejecutar();

    const hechos = memoria.obtenerTodo();

    return {
        veredicto:               hechos.veredicto               || "indeterminado",
        situacion_financiera:    hechos.situacion_financiera     || "indeterminada",
        mercado_base:            hechos.mercado_base             || "indeterminada",
        posicion_mercado:        hechos.posicion_mercado         || "indeterminada",
        preparacion_empresarial: hechos.preparacion_empresarial  || "indeterminada",
        capital_evaluado:        hechos.capital                  || "muy_bajo",
        cadenaRazonamiento:      motor.obtenerCadenaRazonamiento(),
        totalReglasDisparadas:   motor.reglasFijadas.length
    };
}
