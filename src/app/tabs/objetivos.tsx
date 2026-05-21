import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

type Status = "pending" | "accepted" | "disputed" | "sent";
type ViewMode = "minhas" | "validar";

interface Goal {
  id: number;
  title: string;
  subtitle: string;
  group: string;
  icon: string;
  iconBg: string;
  status: Status;
  description?: string;
}

interface Validation {
  id: number;
  userName: string;
  taskTitle: string;
  group: string;
  time: string;
  userAvatar: string;
  photoUrl: string;
  isDisputed?: boolean;
  disputeReason?: string;
  disputedBy?: string;
}

// --- DADOS MOCKADOS ---
const goals: Goal[] = [
  {
    id: 1,
    title: "Treinar 1 hora",
    subtitle: "Marombeiros · até 22:00",
    group: "marombeiros",
    icon: "🏋️",
    iconBg: "#1a2a1a",
    status: "pending",
    description: "Ir à academia e completar o treino de membros inferiores.",
  },
  {
    id: 2,
    title: "Sem redes sociais pela manhã",
    subtitle: "Inateleiros · ⚠️ contestado",
    group: "inateleiros",
    icon: "📵",
    iconBg: "#1a1a2a",
    status: "disputed",
    description: "Ficar até as 12h sem abrir Instagram ou TikTok.",
  },
];

const pendingValidations: Validation[] = [
  {
    id: 1,
    userName: "João Victor",
    taskTitle: "Sem redes sociais pela manhã",
    group: "inateleiros",
    time: "Há 10 min",
    userAvatar: "JV",
    photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop", // Foto de exemplo (celular bloqueado)
  },
  {
    id: 2,
    userName: "Mateus",
    taskTitle: "Treinar 1 hora",
    group: "marombeiros",
    time: "Há 45 min",
    userAvatar: "MT",
    photoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop", // Foto de exemplo (academia)
    isDisputed: true,
    disputeReason: "A foto está escura e não dá pra ver se é a academia mesmo, parece uma foto antiga.",
    disputedBy: "Diogo",
  },
];

export default function ObjetivosScreen() {
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [viewMode, setViewMode] = useState<ViewMode>("minhas");

  // Estados dos Modais
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [validationToReject, setValidationToReject] = useState<Validation | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredGoals = useMemo(() => {
    if (selectedFilter === "todos") return goals;
    return goals.filter((goal) => goal.group === selectedFilter);
  }, [selectedFilter]);

  const filteredValidations = useMemo(() => {
    if (selectedFilter === "todos") return pendingValidations;
    return pendingValidations.filter((val) => val.group === selectedFilter);
  }, [selectedFilter]);

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "pending": return { bg: "#2a1e00", color: "#ffaa33", label: "Pendente" };
      case "accepted": return { bg: "#0a1e0a", color: "#33cc66", label: "Aceito" };
      case "disputed": return { bg: "#2a0a0a", color: "#ff5555", label: "Contestado" };
      case "sent": return { bg: "#0a1a2a", color: "#5599ff", label: "Em Análise" };
    }
  };

  const handleRejectSubmit = () => {
    console.log("Recusado motivo:", rejectionReason);
    setValidationToReject(null);
    setRejectionReason("");
    // Aqui entra a lógica de enviar pro banco de dados a contestação
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* HEADER & VIEW TOGGLE (Mantido igual) */}
        <View style={styles.header}>
          <Text style={styles.title}>Objetivos</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              activeOpacity={0.8} onPress={() => setViewMode("minhas")}
              style={[styles.toggleBtn, viewMode === "minhas" && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, viewMode === "minhas" && styles.toggleTextActive]}>Minhas Metas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8} onPress={() => setViewMode("validar")}
              style={[styles.toggleBtn, viewMode === "validar" && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, viewMode === "validar" && styles.toggleTextActive]}>Validar Colegas</Text>
              {pendingValidations.length > 0 && (
                <View style={styles.badgeContainer}><Text style={styles.badgeText}>{pendingValidations.length}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* FILTROS (Mantido igual) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {[{ label: "Todos", value: "todos" }, { label: "Inateleiros", value: "inateleiros" }, { label: "Marombeiros", value: "marombeiros" }].map((filter) => {
            const active = selectedFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value} activeOpacity={0.8} onPress={() => setSelectedFilter(filter.value)}
                style={[styles.chip, active && styles.activeChip]}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{filter.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>
          {viewMode === "minhas" ? `Hoje · ${filteredGoals.length} objetivos` : `Pendentes · ${filteredValidations.length} validações`}
        </Text>

        {/* LISTA DINÂMICA */}
        {viewMode === "minhas" ? (
          filteredGoals.map((goal) => {
            const status = getStatusStyle(goal.status);
            return (
              <TouchableOpacity key={goal.id} activeOpacity={0.85} style={styles.goalCard} onPress={() => setSelectedGoal(goal)}>
                <View style={[styles.iconContainer, { backgroundColor: goal.iconBg }]}><Text style={styles.icon}>{goal.icon}</Text></View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                </View>
                <View style={styles.rightContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#444" />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          filteredValidations.map((val) => (
            <View key={val.id} style={[styles.validationCard, val.isDisputed && styles.validationCardDisputed]}>
              {/* Header do Card */}
              <View style={styles.valHeader}>
                <View style={styles.valUserArea}>
                  <View style={[styles.iconContainer, { backgroundColor: '#1a1a2a', width: 36, height: 36, marginRight: 10 }]}>
                    <Text style={styles.avatarText}>{val.userAvatar}</Text>
                  </View>
                  <View>
                    <Text style={styles.goalTitle}>{val.userName}</Text>
                    <Text style={styles.goalSubtitle}>{val.time} · {val.group}</Text>
                  </View>
                </View>
                <Text style={styles.valTaskTitle}>{val.taskTitle}</Text>
              </View>

              {/* Foto da Evidência (Movida para cima do alerta) */}
              <Image source={{ uri: val.photoUrl }} style={styles.evidenceImage} />

              {/* Se for disputa, mostra o alerta estilizado */}
              {val.isDisputed && (
                <View style={styles.disputeAlert}>
                  <Ionicons name="warning" size={20} color="#ff8888" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disputeTitle}>REVISÃO DO GRUPO</Text>
                    <Text style={styles.disputeReason}>{val.disputedBy} contestou: "{val.disputeReason}"</Text>
                  </View>
                </View>
              )}

              {/* Botões de Ação */}
              <View style={styles.validationActions}>
                {val.isDisputed ? (
                  <>
                    <TouchableOpacity style={[styles.actionBtnReject, styles.btnDisputeReject]} >
                      <Ionicons name="close-circle" size={18} color="#ff5555" />
                      <Text style={styles.rejectText}>Inválidar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtnApprove, styles.btnDisputeApprove]}>
                      <Ionicons name="checkmark-circle" size={18} color="#33cc66" />
                      <Text style={styles.approveText}>Sem erros</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.actionBtnReject} onPress={() => setValidationToReject(val)}>
                      <Ionicons name="close" size={24} color="#ff5555" />
                      <Text style={styles.rejectText}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnApprove}>
                      <Ionicons name="checkmark" size={24} color="#33cc66" />
                      <Text style={styles.approveText}>Aprovar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL: DETALHES E ENVIO DE EVIDÊNCIA */}
     <Modal 
  visible={!!selectedGoal} 
  animationType="slide" 
  presentationStyle="pageSheet" 
  onRequestClose={() => setSelectedGoal(null)}
>
  <View style={styles.modalContainer}>
    {/* Header fixo fica fora do ScrollView */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Detalhes da Meta</Text>
      <TouchableOpacity onPress={() => setSelectedGoal(null)}>
        <Ionicons name="close-circle" size={28} color="#444" />
      </TouchableOpacity>
    </View>
    
    {/* Conteúdo rolável */}
    <ScrollView contentContainerStyle={styles.modalContent}
    showsVerticalScrollIndicator={false}>
      {selectedGoal && (
        <>
          <View style={styles.modalGoalHeader}>
            <View style={[styles.iconContainer, { backgroundColor: selectedGoal.iconBg, width: 64, height: 64 }]}><Text style={{fontSize: 32}}>{selectedGoal.icon}</Text></View>
            <Text style={styles.modalGoalTitle}>{selectedGoal.title}</Text>
            <Text style={styles.modalGoalGroup}>Grupo: {selectedGoal.group}</Text>
          </View>
          
          <Text style={styles.modalSectionTitle}>Descrição</Text>
          <Text style={styles.modalDescription}>{selectedGoal.description}</Text>

          <Text style={styles.modalSectionTitle}>Sua Evidência</Text>
          <TouchableOpacity style={styles.uploadArea}>
            <Feather name="camera" size={32} color="#666" />
            <Text style={styles.uploadText}>Tirar foto ou gravar vídeo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Enviar para Validação</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  </View>
</Modal>

      {/* MODAL: MOTIVO DA RECUSA */}
      <Modal visible={!!validationToReject} animationType="fade" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Contestar Evidência</Text>
            <Text style={styles.dialogSubtitle}>A foto enviada por {validationToReject?.userName} será enviada para uma nova votação do grupo. Descreva o motivo:</Text>
            
            <TextInput
              style={styles.inputArea}
              placeholder="Ex: Foto escura, não cumpriu a regra..."
              placeholderTextColor="#666"
              multiline
              value={rejectionReason}
              onChangeText={setRejectionReason}
              autoFocus
            />

            <View style={styles.dialogActions}>
              <TouchableOpacity style={styles.dialogBtnCancel} onPress={() => setValidationToReject(null)}>
                <Text style={styles.dialogBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogBtnConfirm} onPress={handleRejectSubmit}>
                <Text style={styles.dialogBtnConfirmText}>Enviar Contestação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  header: { paddingHorizontal: 20, paddingTop: 18 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 16 },
  toggleContainer: { flexDirection: "row", backgroundColor: "#161616", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: "#1f1f1f" },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderRadius: 8, flexDirection: "row", gap: 6 },
  toggleBtnActive: { backgroundColor: "#2a2a2a" },
  toggleText: { color: "#666", fontSize: 14, fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  badgeContainer: { backgroundColor: "#0a1a2a", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: "#5599ff" },
  badgeText: { color: "#5599ff", fontSize: 10, fontWeight: "bold" },
  filtersContainer: { paddingHorizontal: 20, gap: 10, marginTop: 18 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#222", backgroundColor: "transparent" },
  activeChip: { backgroundColor: "#fff", borderColor: "#fff" },
  chipText: { color: "#666", fontSize: 13, fontWeight: "500" },
  activeChipText: { color: "#000" },
  sectionLabel: { color: "#444", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginTop: 24, marginBottom: 10, paddingHorizontal: 20, fontWeight: "600" },
  
  // Cards Minhas Metas
  goalCard: { marginHorizontal: 20, marginBottom: 10, backgroundColor: "#161616", borderRadius: 18, borderWidth: 1, borderColor: "#1f1f1f", padding: 16, flexDirection: "row", alignItems: "center" },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 14 },
  icon: { fontSize: 22 },
  goalInfo: { flex: 1 },
  goalTitle: { color: "#fff", fontSize: 15, fontWeight: "600", marginTop: 2 },
  goalSubtitle: { color: "#666", fontSize: 12 },
  rightContainer: { alignItems: "flex-end", gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "600" },

  // Cards de Validação
  validationCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: "#161616", borderRadius: 18, borderWidth: 1, borderColor: "#1f1f1f", overflow: "hidden" },
  
  // Novo Estilo Adicionado: Borda do card contestado
  validationCardDisputed: { 
    backgroundColor: "#3a1c1c", // Fundo vermelho escuro para destacar
    borderWidth: 0,             // Remove a borda se quiser um visual mais "limpo"
  },
  
  valHeader: { padding: 16 },
  
  valUserArea: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatarText: { color: "#5599ff", fontWeight: "bold", fontSize: 14 },
  valTaskTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  evidenceImage: { width: "100%", height: 200, backgroundColor: "#111" },
  
  // Estilos Modificados: Alerta de Disputa e Textos
  disputeAlert: { flexDirection: "row", backgroundColor: "#b71212", padding: 16, alignItems: "flex-start", gap: 12 },
  disputeTitle: { color: "#ffffff", fontSize: 14, fontWeight: "900", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" },
  disputeReason: { color: "#ffffff", fontSize: 13, fontStyle: "italic", lineHeight: 18 },

  validationActions: { flexDirection: "row", borderTopWidth: 1, borderColor: "#1f1f1f" },
  actionBtnReject: { flex: 1, flexDirection: "row", paddingVertical: 16, justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: "rgba(255, 85, 85, 0.05)" },
  actionBtnApprove: { flex: 1, flexDirection: "row", paddingVertical: 16, justifyContent: "center", alignItems: "center", gap: 8, backgroundColor: "rgba(51, 204, 102, 0.05)", borderLeftWidth: 1, borderColor: "#1f1f1f" },
  
  // Novos Estilos Adicionados: Fundo dos botões em caso de disputa
  btnDisputeReject: { backgroundColor: "#3a1c1c", borderLeftWidth: 0 },
  btnDisputeApprove: { backgroundColor: "#1c2e1c", borderLeftWidth: 0 },

  rejectText: { color: "#ff5555", fontWeight: "600", fontSize: 14 }, // Tamanho ajustado para caber o novo texto
  approveText: { color: "#33cc66", fontWeight: "600", fontSize: 14 }, // Tamanho ajustado para caber o novo texto

  // Estilos Modal Minhas Metas
  modalContainer: { flex: 1, backgroundColor: "#0d0d0d", paddingTop: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderColor: "#1f1f1f" },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContent: { padding: 20 },
  modalGoalHeader: { alignItems: "center", marginBottom: 30 },
  modalGoalTitle: { color: "#fff", fontSize: 24, fontWeight: "bold", marginTop: 16, textAlign: "center" },
  modalGoalGroup: { color: "#666", fontSize: 14, marginTop: 4, textTransform: "capitalize" },
  modalSectionTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 10 },
  modalDescription: { color: "#999", fontSize: 14, lineHeight: 22, marginBottom: 30 },
  uploadArea: { height: 160, borderRadius: 16, borderWidth: 2, borderColor: "#222", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#111", marginBottom: 30 },
  uploadText: { color: "#666", marginTop: 12, fontSize: 14, fontWeight: "500" },
  btnPrimary: { backgroundColor: "#36693b", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnPrimaryText: { color: "#000", fontSize: 16, fontWeight: "bold" },

  // Estilos Modal Contestação
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 20 },
  dialogBox: { width: "100%", backgroundColor: "#161616", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#2a2a2a" },
  dialogTitle: { color: "#ff5555", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  dialogSubtitle: { color: "#999", fontSize: 13, marginBottom: 20, lineHeight: 18 },
  inputArea: { backgroundColor: "#0d0d0d", borderRadius: 12, padding: 16, color: "#fff", fontSize: 14, minHeight: 100, textAlignVertical: "top", borderWidth: 1, borderColor: "#222", marginBottom: 20 },
  dialogActions: { flexDirection: "row", gap: 12 },
  dialogBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", backgroundColor: "#222" },
  dialogBtnCancelText: { color: "#fff", fontWeight: "600" },
  dialogBtnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center", backgroundColor: "#ff5555" },
  dialogBtnConfirmText: { color: "#fff", fontWeight: "600" },
});