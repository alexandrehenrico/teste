import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { calculateTotalr } from './receitas/ListScreen.js';
import { calculateTotalma } from './maodeobra/ListScreen.js';
import { calculateTotald } from './despesas/ListScreen.js';
import { useData } from './DataContext.js';


export default function VisaoGeral() {
  const { maoDeObraRecords, receitasRecords, despesasRecords } = useData();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
 
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showPicker, setShowPicker] = useState({ start: false, end: false });

  const months = ['Todos os meses', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const filterRecordsByMonth = (records, month) => {
    if (!month || month === 0) return records;
    return records.filter(record => record.mes === month);
  };

  const filterRecordsByDate = (records, startDate, endDate) => {
    if (!startDate && !endDate) return records;

    return records.filter(record => {
      const recordDate = new Date(record.data); // Supondo que 'data' é o campo com a data nos registros
      if (startDate && recordDate < startDate) return false;
      if (endDate && recordDate > endDate) return false;
      return true;
    });
  };

  const filteredMaoDeObra = useMemo(() => filterRecordsByDate(filterRecordsByMonth(maoDeObraRecords, selectedMonth), startDate, endDate), [maoDeObraRecords, selectedMonth, startDate, endDate]);
  const filteredReceitas = useMemo(() => filterRecordsByDate(filterRecordsByMonth(receitasRecords, selectedMonth), startDate, endDate), [receitasRecords, selectedMonth, startDate, endDate]);
  const filteredDespesas = useMemo(() => filterRecordsByDate(filterRecordsByMonth(despesasRecords, selectedMonth), startDate, endDate), [despesasRecords, selectedMonth, startDate, endDate]);

  const totalMaoDeObra = useMemo(() => calculateTotalma(filteredMaoDeObra), [filteredMaoDeObra]);
  const totalReceitas = useMemo(() => calculateTotalr(filteredReceitas), [filteredReceitas]);
  const totalDespesas = useMemo(() => calculateTotald(filteredDespesas), [filteredDespesas]);

  const totalSaidas = totalMaoDeObra + totalDespesas;
  const saldo = totalReceitas - totalSaidas;

  const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('pt-BR') : 'Selecionar';
  };

 
  const DetailBox = ({ label, value, valueStyle }) => (
    <View style={styles.detailBox}>
      <Text style={styles.detailText}>
        <Text>{label}</Text> <Text style={valueStyle}>{formatCurrency(value)}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fluxo de Caixa</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter-list" size={28} color="#fff" style={{ marginRight: 15 }} />
          </TouchableOpacity>
        
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={[styles.summaryText, styles.saldoText]}>
          Saldo: {saldo >= 0 ? '' : '-'} {formatCurrency(Math.abs(saldo))}
        </Text>
        <Text style={styles.summaryText}>
          Entradas: <Text style={{ color: '#fff' }}>{formatCurrency(totalReceitas)}</Text>
        </Text>
        <Text style={styles.summaryText}>
          Saídas: <Text style={{ color: '#fff' }}>{formatCurrency(totalSaidas)}</Text>
        </Text>
      </View>

      <ScrollView>
        <DetailBox label="Receitas" value={totalReceitas} valueStyle={styles.receitasValue} />
        <DetailBox label="Despesas" value={totalDespesas} valueStyle={styles.despesasValue} />
        <DetailBox label="Mão de Obra" value={totalMaoDeObra} valueStyle={styles.maoDeObraValue} />
      </ScrollView>

      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar Intervalo de Datas</Text>

            <View style={styles.datePickerContainer}>
              <Text style={styles.label}>De:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker({ ...showPicker, start: true })}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              {showPicker.start && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker({ ...showPicker, start: false });
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.datePickerContainer}>
              <Text style={styles.label}>Até:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker({ ...showPicker, end: true })}
              >
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              {showPicker.end && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowPicker({ ...showPicker, end: false });
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#058301',
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryBox: {
    backgroundColor: '#058301',
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  summaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saldoText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 15,
  },
  detailBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#058301',
    borderRadius: 10,
    padding: 10,
    margin: 15,
    marginVertical: 8,
  },
  detailText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  dateButton: {
    backgroundColor: '#058301',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  applyButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#058301',
    borderRadius: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#058301',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  receitasValue: {
    color: '#058301',
  },
  despesasValue: {
    color: 'red',
  },
  maoDeObraValue: {
    color: 'red',
  },
});
