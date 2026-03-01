"use client";
import { useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { format, getDaysInMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Feriado {
  date: string;
  name: string;
  type?: string;
}

interface BoletoTransportePDFProps {
  inicio: Date;
  fim: Date;
  totalDias: number;
  diasContados: number;
  feriadosContados: number;
  preco: number;
  transportes: Array<{
    name: string;
    passagens: number;
    valor: string;
  }>;
  feriados: Feriado[];
  recessos: Feriado[];
  week: Record<string, boolean>;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderStyle: "solid",
    borderBottomWidth: 2,
    borderBottomColor: "#f0c15b",
    paddingBottom: 8,
  },
  headerLeft: {},
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f0c15b",
    margin: 0,
  },
  periodo: {
    fontSize: 10,
    color: "#666",
  },
  preco: {
    fontSize: 16,
    fontWeight: 700,
  },
  precoLabel: {
    fontSize: 10,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 8,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 8,
  },
  table: {
    width: "100%",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    fontWeight: 700,
    marginBottom: 4,
  },
  tableCellLeft: {
    textAlign: "left",
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 4,
    fontWeight: 700,
  },
  calendarioContainer: {
    marginTop: 16,
  },
  calendarioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  calendarioMes: {
    width: 210,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eee",
    padding: 8,
  },
  mesTitulo: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 8,
  },
  diasSemana: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 4,
    fontSize: 9,
    color: "#666",
  },
  diaHeader: {
    width: 22,
    textAlign: "center",
    fontSize: 9,
    color: "#666",
  },
  diasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  dia: {
    width: 22,
    height: 22,
    fontSize: 9,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 2,
  },
  diaTrabalhado: {
    backgroundColor: "#fde68a",
    color: "#333",
    borderColor: "#f0c15b",
    opacity: 1,
  },
  diaFeriado: {
    backgroundColor: "#fecaca",
    color: "#333",
    borderColor: "#ef4444",
    opacity: 1,
  },
  diaRecesso: {
    backgroundColor: "#c7f9cc",
    color: "#333",
    borderColor: "#22c55e",
    opacity: 1,
  },
  diaFora: {
    backgroundColor: "#f7f7f7",
    color: "#6b6b6b",
    borderColor: "#e6e6e6",
    opacity: 1,
  },
  legenda: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
    fontSize: 8,
    color: "#666",
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eee",
  },
  infoBoleto: {
    flexDirection: "row",
    gap: 24,
    marginTop: 20,
    borderStyle: "solid",
    borderTopWidth: 2,
    borderTopColor: "#f0c15b",
    paddingTop: 16,
  },
  infoLeft: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: {
    color: "#666",
  },
  infoValue: {
    fontWeight: 700,
  },
  infoRight: {
    width: 200,
    alignItems: "center",
  },
  valorTotal: {
    fontSize: 22,
    fontWeight: 700,
    color: "#f0c15b",
    marginTop: 4,
    marginBottom: 8,
  },
  codigoBarras: {
    marginTop: 12,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
    fontSize: 8,
    fontFamily: "Courier",
    letterSpacing: 2,
  },
  rodape: {
    marginTop: 30,
    paddingTop: 12,
    borderStyle: "solid",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default function BoletoTransportePDF(props: BoletoTransportePDFProps) {
  useEffect(() => {
    const parseValor = (valor: string): number => {
      return parseFloat(valor.replace(/[R$ ]/g, "").replace(".", "").replace(",", ".")) || 0;
    };

    const getMonthsBetween = () => {
      const months: Array<{ year: number; month: number; name: string }> = [];
      const current = new Date(props.inicio.getFullYear(), props.inicio.getMonth(), 1);
      const endDate = new Date(props.fim.getFullYear(), props.fim.getMonth() + 1, 0);

      while (current < endDate) {
        const monthName = format(current, "MMMM yyyy", { locale: ptBR });
        months.push({
          year: current.getFullYear(),
          month: current.getMonth(),
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        });
        current.setMonth(current.getMonth() + 1);
      }
      return months;
    };

    const isWithinRange = (date: Date) => {
      return date >= props.inicio && date <= props.fim;
    };

    const weekDays = [
      "domingo",
      "segunda",
      "terça",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];

    const isWorkedDay = (date: Date) => {
      if (!isWithinRange(date)) return false;
      const iso = date.toISOString().split("T")[0];
      const isHoliday = props.feriados.some((f) => f.date === iso);
      const isRecesso = props.recessos.some((r) => r.date === iso);
      const dayName = weekDays[date.getDay()];
      const trabalhaNesseDia = !!props.week?.[dayName];
      return trabalhaNesseDia && !isHoliday && !isRecesso;
    };

    const calcularPassagensNoMes = (month: { year: number; month: number }) => {
      const daysInMonth = getDaysInMonth(new Date(month.year, month.month));
      let count = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(month.year, month.month, day);
        if (isWorkedDay(date)) count++;
      }
      return count;
    };

    const calcularValorNoMes = (passagens: number) => {
      if (!props.transportes || props.transportes.length === 0) return 0;
      return props.transportes.reduce((sum, t) => {
        const valorUnit = parseValor(t.valor || "0");
        const qtdPassagens = t.passagens || 0;
        return sum + passagens * qtdPassagens * valorUnit;
      }, 0);
    };

    const months = getMonthsBetween();
    const totalPassagensNoAno = months.reduce((acc, month) => acc + calcularPassagensNoMes(month), 0);

    const generatePDF = async () => {
      const blob = await pdf(
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                  <Text style={styles.title}>Boleto de Transporte</Text>
                  <Text style={styles.periodo}>
                    Período: {format(props.inicio, "dd/MM/yyyy")} — {format(props.fim, "dd/MM/yyyy")}
                  </Text>
                  <Text style={[styles.periodo, { marginTop: 4 }]}>Dias trabalhados: {props.diasContados}</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.preco}>
                  {props.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
                <Text style={styles.precoLabel}>Pagamento estimado</Text>
              </View>
            </View>

            {/* Detalhes + Resumo */}
            <View style={styles.row}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Detalhes</Text>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text>Data de Início</Text>
                    <Text>{format(props.inicio, "dd/MM/yyyy")}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text>Data de Fim</Text>
                    <Text>{format(props.fim, "dd/MM/yyyy")}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text>Total dias</Text>
                    <Text>{props.totalDias}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text>Dias trabalhados</Text>
                    <Text>{props.diasContados}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text>Feriados</Text>
                    <Text>{props.feriadosContados}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, { width: 260 }]}>
                <Text style={styles.cardTitle}>Resumo por transporte</Text>
                <View style={styles.tableHeader}>
                  <Text>Transporte</Text>
                  <Text>Subtotal</Text>
                </View>
                {props.transportes.map((t) => {
                  const subtotal = t.passagens * parseValor(t.valor) * props.diasContados;
                  return (
                    <View key={t.name} style={styles.tableRow}>
                      <Text>
                        {t.name} x {t.passagens}
                      </Text>
                      <Text>
                        {subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.tableFooter}>
                  <Text>Total</Text>
                  <Text>
                    {props.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Custos mensais */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.cardTitle, { fontSize: 12 }]}>Custos Mensais</Text>
                <View style={[styles.table, {
              borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#eee",
      }]}>
                <View style={[styles.tableRow, { backgroundColor: "#f5f5f5" }]}>
                  <Text style={{ width: "40%" }}>Mês</Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>Dias trabalhados</Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>Valor Unit. / Pass.</Text>
                  <Text style={{ width: "20%", textAlign: "right" }}>Total</Text>
                </View>
                {months.map((month) => {
                  const passagensNoMes = calcularPassagensNoMes(month);
                  const valorNoMes = calcularValorNoMes(passagensNoMes);
                  return (
                    <View key={`${month.year}-${month.month}`} style={styles.tableRow}>
                      <Text style={{ width: "40%" }}>{month.name}</Text>
                      <Text style={{ width: "20%", textAlign: "center" }}>{passagensNoMes}</Text>
                      <Text style={{ width: "20%", textAlign: "center" }}>
                        {props.transportes && props.transportes.length > 0
                          ? props.transportes.map((t) => `${t.name}: ${t.valor} × ${t.passagens}`).join("\n")
                          : "R$ 0,00"}
                      </Text>
                      <Text style={{ width: "20%", textAlign: "right" }}>
                        {valorNoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </Text>
                    </View>
                  );
                })}
                <View style={[styles.tableRow, { fontWeight: 700, backgroundColor: "#f9f9f9" }]}>
                  <Text style={{ width: "40%" }}>TOTAL</Text>
                  <Text style={{ width: "20%", textAlign: "center" }}>{totalPassagensNoAno}</Text>
                  <Text style={{ width: "20%", textAlign: "center" }}></Text>
                  <Text style={{ width: "20%", textAlign: "right" }}>
                    {props.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Calendário */}
            <View style={styles.calendarioContainer}>
              <Text style={[styles.cardTitle, { fontSize: 12 }]}>Calendário</Text>
              <View style={styles.calendarioGrid}>
                {months.map((m) => {
                  const first = new Date(m.year, m.month, 1);
                  const last = new Date(m.year, m.month + 1, 0);
                  const daysInMonth = last.getDate();
                  const monthName = format(first, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) =>
                    c.toUpperCase()
                  );

                  const firstWeekday = first.getDay();
                  const prevMonthLastDate = new Date(m.year, m.month, 0).getDate();
                  const cells: unknown[] = [];

                  for (let i = 0; i < 42; i++) {
                    const dayNum = i - firstWeekday + 1;

                    let displayNum: number;
                    let cellDate: Date;
                    let isCurrentMonth = true;

                    if (dayNum < 1) {
                      displayNum = prevMonthLastDate + dayNum;
                      cellDate = new Date(m.year, m.month - 1, displayNum);
                      isCurrentMonth = false;
                    } else if (dayNum > daysInMonth) {
                      displayNum = dayNum - daysInMonth;
                      cellDate = new Date(m.year, m.month + 1, displayNum);
                      isCurrentMonth = false;
                    } else {
                      displayNum = dayNum;
                      cellDate = new Date(m.year, m.month, displayNum);
                    }

                    let diaStyle = [styles.dia, styles.diaFora];

                    if (isCurrentMonth) {
                      const worked = isWorkedDay(cellDate);
                      const isHoliday = props.feriados.some((f) => f.date === format(cellDate, "yyyy-MM-dd"));
                      const isRecesso = props.recessos.some((r) => r.date === format(cellDate, "yyyy-MM-dd"));

                      if (worked) diaStyle = [styles.dia, styles.diaTrabalhado];
                      else if (isHoliday) diaStyle = [styles.dia, styles.diaFeriado];
                      else if (isRecesso) diaStyle = [styles.dia, styles.diaRecesso];
                      else diaStyle = [styles.dia, styles.diaFora];
                    } else {
                      diaStyle = [styles.dia, styles.diaFora];
                    }

                    cells.push(
                      <View key={`${m.year}-${m.month}-cell-${i}`} style={diaStyle}>
                        <Text>{displayNum}</Text>
                      </View>,
                    );
                  }

                  const rows: React.ReactNode[] = [];
                  const totalCellsNeeded = firstWeekday + daysInMonth;
                  const rowsCount = Math.ceil(totalCellsNeeded / 7);
                  for (let r = 0; r < rowsCount; r++) {
                    const rowCells = cells.slice(r * 7, r * 7 + 7) as React.ReactNode[];
                    rows.push(
                      <View key={`${m.year}-${m.month}-row-${r}`} style={{ flexDirection: "row" }}>
                        {rowCells}
                      </View>,
                    );
                  }

                  return (
                    <View key={`${m.year}-${m.month}`} style={styles.calendarioMes}>
                      <Text style={styles.mesTitulo}>{monthName}</Text>
                      <View style={styles.diasSemana}>
                        <Text style={styles.diaHeader}>D</Text>
                        <Text style={styles.diaHeader}>S</Text>
                        <Text style={styles.diaHeader}>T</Text>
                        <Text style={styles.diaHeader}>Q</Text>
                        <Text style={styles.diaHeader}>Q</Text>
                        <Text style={styles.diaHeader}>S</Text>
                        <Text style={styles.diaHeader}>S</Text>
                      </View>
                      <View>{rows}</View>
                    </View>
                  );
                })}
              </View>

              {/* Legenda */}
              <View style={styles.legenda}>
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: "#fde68a" }]} />
                  <Text>Trabalhado</Text>
                </View>
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: "#fecaca" }]} />
                  <Text>Feriado</Text>
                </View>
                {/* <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: "#c7f9cc" }]} />
                  <Text>Recesso</Text>
                </View> */}
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaCor, { backgroundColor: "#f8fafc" }]} />
                  <Text>Fora do período</Text>
                </View>
              </View>
            </View>

            {/* Informações do Boleto */}
            {/* <View style={styles.infoBoleto}>
              <View style={styles.infoLeft}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Vencimento</Text>
                  <Text style={styles.infoValue}>{format(props.fim, "dd/MM/yyyy")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nº do Documento</Text>
                  <Text style={styles.infoValue}>2026-{format(props.inicio, "MMdd")}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nosso Número</Text>
                  <Text style={[styles.infoValue, { fontFamily: "Courier" }]}>8934600008-9</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CPF/CNPJ Pagador</Text>
                  <Text style={[styles.infoValue, { fontFamily: "Courier" }]}>123.456.789-00</Text>
                </View>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoLabel}>VALOR TOTAL</Text>
                <Text style={styles.valorTotal}>
                  {props.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
                <Text style={styles.codigoBarras}>
                  {Array.from({ length: 30 }).map(() => "█").join("")}
                </Text>
                <Text style={{ fontSize: 7, color: "#999", marginTop: 2 }}>CÓDIGO DE BARRAS</Text>
              </View>
            </View> */}

            {/* Rodapé */}
            <Text style={styles.rodape}>
              Documento gerado automaticamente em {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")} · Calculadora de
              Transporte Docente
            </Text>
          </Page>
        </Document>
      ).toBlob();

      // Download do PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `boleto-transporte-${format(props.inicio, "dd-MM-yyyy")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    };

    generatePDF();
  }, [
    props.inicio,
    props.fim,
    props.totalDias,
    props.diasContados,
    props.feriadosContados,
    props.preco,
    JSON.stringify(props.transportes || []),
    JSON.stringify(props.feriados || []),
    JSON.stringify(props.recessos || []),
    JSON.stringify(props.week || {}),
  ]);

  return null;
}