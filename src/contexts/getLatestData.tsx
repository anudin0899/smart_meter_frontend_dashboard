type DataRow = {
  FV: number;
  FR: number;
  Today: number;
  NetTotal: number;
  MeterCode: string;
  LocalTimeCol: string;
};

export function getLatestPerMeterCode(dataArray: DataRow[] = []): DataRow[] {
  const latest: { [meter: string]: DataRow } = {};

  dataArray.forEach(item => {
    const meter = item.MeterCode;
    const time = new Date(item.LocalTimeCol);

    if (!latest[meter] || time > new Date(latest[meter].LocalTimeCol)) {
      latest[meter] = item;
    }
  });

  return Object.values(latest);
}