const CONSTANT = {
  WEB_SERVER_URL: process.env.WEB_SERVER_URL || 'http://127.0.0.1:8000',
  VERSION: 'v1.0.0',
  THING_STATUS: {
    // 运转启停
    STOP: 0,
    RUNNING: 1,
  },
  CONDITION_EXPRESSION: {
    EQUAL: 1, // =
    LARGER: 2, // >
    LARGER_EQUAL: 3, // >=
    SMALLER: 4, // <
    SMALLER_EQUAL: 5, // <=
  },
  REFRESH_FREQUENCY: 5000,
  PROPERTY_TYPE: {
    mainEngine_rpm: {
      label: "主机轴转速",
      unit: "rpm",
    },
    mainEngine_torque: {
      label: "主机输出扭矩",
      unit: "kN·m",
    },
    mainEngine_power: {
      label: "主机输出功率",
      unit: "kW",
    },
    mainEngine_fuelFlow: {
      label: "主机燃油消耗流量",
      unit: "L/h",
    },
    mainEngine_cylinderTemp: {
      label: "主机缸体温度",
      unit: "℃",
    },
    auxEngine_rpm: {
      label: "辅机转速",
      unit: "rpm",
    },
    auxEngine_oilPressure: {
      label: "辅机油压",
      unit: "bar",
    },
    auxEngine_oilTemp: {
      label: "辅机润滑油温度",
      unit: "℃",
    },
    auxEngine_current: {
      label: "辅机电流负载",
      unit: "A",
    },
    boiler_pressure: {
      label: "锅炉蒸汽压力",
      unit: "bar",
    },
    boiler_waterTemp: {
      label: "锅炉水温/蒸汽温度",
      unit: "℃",
    },
    boiler_flowRate: {
      label: "锅炉水流量",
      unit: "L/min",
    },
  },
  QUERY_MODELS: `/tm/query`,
  GET_MODEL: `/tm/get/`,
  CREATE_MODEL: `/tm`,
  QUERY_INSTANCES: `/ti/query/`,
  GET_INSTANCE: `/ti/get/`,
  REGISTER_INSTANCE: `/ti`,
  DATA_REALTIME_ORIGINAL: `/data/ot/rt/`,
  DATA_HISTORY_ORIGINAL: `/data/ot/history/`,
  DATA_ALERT: `/data/alert/`,
}

export default CONSTANT;