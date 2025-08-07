import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Switch, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function TaskScreen() {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dateTime: "", completed: false, priority: "baixa" });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filter, setFilter] = useState("todas");
  const [sortBy, setSortBy] = useState("data");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log("Nenhum usuário logado.");
      return;
    }

    const subscriber = firestore()
      .collection("tarefas")
      .where("owner", "==", currentUser.uid)
      .orderBy("dateTime")
      .onSnapshot(querySnapshot => {
        const loadedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(loadedTasks);
      }, error => {
        console.error("Erro ao buscar tarefas: ", error);
      });

    return () => subscriber();
  }, []);

  // Adicionar nova tarefa
  const addTask = async () => {
    if (newTask.title.trim() === "") return;

    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const taskWithOwner = { ...newTask, owner: currentUser.uid };
      const docRef = await firestore().collection("tarefas").add(taskWithOwner);
      console.log("Tarefa adicionada com ID: ", docRef.id);

      setNewTask({ title: "", description: "", dateTime: "", completed: false, priority: "baixa" });
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao adicionar tarefa: ", error);
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setNewTask({
      ...newTask,
      dateTime: date.toISOString()
    });
    hideDatePicker();
  };

  const toggleTaskCompletion = async (id, completed) => {
    try {
      await firestore().collection("tarefas").doc(id).update({ completed: !completed });
    } catch (error) {
      console.error("Erro ao atualizar tarefa: ", error);
    }
  };

  const handleLongPress = (id) => {
    setSelectedTasks(prev => prev.includes(id)
      ? prev.filter(taskId => taskId !== id)
      : [...prev, id]
    );
  };

  const deleteTask = (id) => {
    Alert.alert("Excluir Tarefa", "Tem certeza que deseja excluir esta tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", onPress: async () => {
          try {
            await firestore().collection("tarefas").doc(id).delete();
          } catch (error) {
            console.error("Erro ao excluir tarefa: ", error);
          }
        }
      }
    ]);
  };

  const deleteSelectedTasks = () => {
    Alert.alert("Excluir Selecionadas", "Excluir todas as selecionadas?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", onPress: async () => {
          try {
            const batch = firestore().batch();
            selectedTasks.forEach(id => {
              const ref = firestore().collection("tarefas").doc(id);
              batch.delete(ref);
            });
            await batch.commit();
            setSelectedTasks([]);
          } catch (error) {
            console.error("Erro ao excluir em lote: ", error);
          }
        }
      }
    ]);
  };

  // Filtros
  const filteredTasks = tasks.filter(task => {
    if (filter === "concluidas") return task.completed;
    if (filter === "pendentes") return !task.completed;
    return true;
  });

  // Ordenação
  const sortedTasks = filteredTasks.sort((a, b) => {
    if (sortBy === "data") return new Date(a.dateTime) - new Date(b.dateTime);
    if (sortBy === "prioridade") {
      const priority = { alta: 1, media: 2, baixa: 3 };
      return priority[a.priority] - priority[b.priority];
    }
    return 0;
  });

  // Busca
  const searchedTasks = sortedTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tarefas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <FontAwesome name="plus" size={24} color="#058301" />
        </TouchableOpacity>
      </View>

      {/* Filtros e Ordenação */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter("todas")}>
          <Text style={filter === "todas" ? styles.activeFilter : styles.filterText}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("concluidas")}>
          <Text style={filter === "concluidas" ? styles.activeFilter : styles.filterText}>Concluídas</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("pendentes")}>
          <Text style={filter === "pendentes" ? styles.activeFilter : styles.filterText}>Pendentes</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar tarefas..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Lista de Tarefas */}
      <FlatList
        data={searchedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.taskContainer, item.completed && styles.completedTask, selectedTasks.includes(item.id) && styles.selectedTask]}
            onLongPress={() => handleLongPress(item.id)}
            onPress={() => selectedTasks.length > 0 && handleLongPress(item.id)}
          >
            <View style={styles.taskContent}>
              <Text style={[styles.taskTitle, item.completed && styles.completedText]}>{item.title}</Text>
              <Text style={[styles.taskDescription, item.completed && styles.completedText]}>{item.description}</Text>
              {item.dateTime && <Text style={[styles.taskDate, item.completed && styles.completedText]}>{item.dateTime}</Text>}
              <Text style={[styles.taskPriority, { color: item.priority === "alta" ? "#c41616" : item.priority === "media" ? "#ffa500" : "#058301" }]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
            <Switch
              value={item.completed}
              onValueChange={() => toggleTaskCompletion(item.id)}
            />
            {selectedTasks.includes(item.id) && (
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
                <FontAwesome name="trash" size={24} color="#c41616" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Botão para excluir tarefas selecionadas */}
      {selectedTasks.length > 0 && (
        <TouchableOpacity style={styles.deleteAllButton} onPress={deleteSelectedTasks}>
          <Text style={styles.deleteAllButtonText}>Excluir Selecionadas</Text>
        </TouchableOpacity>
      )}

      {/* Modal para adicionar tarefa */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Tarefa</Text>

            <TextInput
              style={styles.input}
              placeholder="Título"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              multiline={true}
              textAlignVertical="top"
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Descrição"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              multiline={true}
              textAlignVertical="top"
            />

            {/* Picker de prioridade */}
            <Picker
              selectedValue={newTask.priority}
              onValueChange={(itemValue) => setNewTask({ ...newTask, priority: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Baixa" value="baixa" />
              <Picker.Item label="Média" value="media" />
              <Picker.Item label="Alta" value="alta" />
            </Picker>

            <TouchableOpacity onPress={showDatePicker} style={styles.reminderButton}>
              <Text style={styles.reminderText}>{newTask.dateTime || "Definir Lembrete"}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={addTask}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 0,
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
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  taskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: '#555',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: "#888",
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: "bold",
  },
  completedTask: {
    backgroundColor: "#e0e0e0",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  selectedTask: {
    borderColor: '#c41616',
    borderWidth: 2,
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteAllButton: {
    backgroundColor: '#c41616',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  filterText: {
    fontSize: 16,
    color: '#666',
  },
  activeFilter: {
    fontSize: 16,
    color: '#058301',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    color: "#058301",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: '900',
  },
  input: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 50,
  },
  descriptionInput: {
    minHeight: 100,
  },
  picker: {
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 5,
  },
  reminderButton: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  reminderText: {
    color: "#058301",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#058301',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#c41616',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: '600',
  },
});