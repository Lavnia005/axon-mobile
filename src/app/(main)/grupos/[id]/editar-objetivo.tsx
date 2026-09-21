import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/api";
import { groupService } from "@/services/groupService";
import { taskService } from "@/services/taskService";
import { colors } from "@/theme";
import { Group } from "@/types/group";
import {
  Task,
  UpdateTaskData,
} from "@/types/task";

const theme = colors.dark;

const UI = {
  purple: "#7A5AF8",
  purpleBright: "#8B6CFF",
  purpleSoft: "#C4B7FF",

  purpleDark: "#211542",

  softSurface: "#151D2D",

  border: "#28334A",
};

type PickerField =
  | "startDate"
  | "startTime"
  | "deadlineDate"
  | "deadlineTime"
  | null;

function getMemberUserId(
  memberUser:
    Group["members"][number]["user"],
) {
  if (typeof memberUser === "string") {
    return memberUser;
  }

  return memberUser._id;
}

function getTaskGroupId(
  group: Task["group"],
) {
  if (typeof group === "string") {
    return group;
  }

  return group._id;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function mergeDate(
  current: Date,
  selected: Date,
) {
  const next = new Date(current);

  next.setFullYear(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate(),
  );

  return next;
}

function mergeTime(
  current: Date,
  selected: Date,
) {
  const next = new Date(current);

  next.setHours(
    selected.getHours(),
    selected.getMinutes(),
    0,
    0,
  );

  return next;
}

export default function EditarObjetivoScreen() {
  const params =
    useLocalSearchParams<{
      id?: string | string[];
      taskId?: string | string[];
    }>();

  const groupId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const taskId =
    Array.isArray(params.taskId)
      ? params.taskId[0]
      : params.taskId;

  const { token, user } =
    useAuth();

  const currentUserId =
    user?.id ??
    user?._id;

  const [group, setGroup] =
    useState<Group | null>(null);

  const [
    originalTask,
    setOriginalTask,
  ] =
    useState<Task | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [points, setPoints] =
    useState("");

  const [
    startsAt,
    setStartsAt,
  ] = useState(new Date());

  const [
    deadline,
    setDeadline,
  ] = useState(
    new Date(
      Date.now() +
        24 * 60 * 60 * 1000,
    ),
  );

  const [
    pickerField,
    setPickerField,
  ] =
    useState<PickerField>(null);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    showSuccess,
    setShowSuccess,
  ] = useState(false);

  const carregarDados =
    useCallback(async () => {
      if (
        !groupId ||
        !taskId ||
        !token
      ) {
        setLoadError(
          "Não foi possível identificar o objetivo.",
        );

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [
          groupResponse,
          taskResponse,
        ] =
          await Promise.all([
            groupService.getGroupById(
              groupId,
              token,
            ),

            taskService.getTaskById(
              taskId,
              token,
            ),
          ]);

        const task =
          taskResponse.task;

        const taskGroupId =
          getTaskGroupId(
            task.group,
          );

        if (
          taskGroupId !==
          groupId
        ) {
          setLoadError(
            "Este objetivo não pertence ao grupo informado.",
          );

          return;
        }

        const startDate =
          new Date(
            task.startsAt,
          );

        const deadlineDate =
          new Date(
            task.deadline,
          );

        if (
          Number.isNaN(
            startDate.getTime(),
          ) ||
          Number.isNaN(
            deadlineDate.getTime(),
          )
        ) {
          setLoadError(
            "As datas deste objetivo são inválidas.",
          );

          return;
        }

        setGroup(
          groupResponse,
        );

        setOriginalTask(
          task,
        );

        setTitle(
          task.title,
        );

        setDescription(
          task.description ??
            "",
        );

        setPoints(
          String(task.points),
        );

        setStartsAt(
          startDate,
        );

        setDeadline(
          deadlineDate,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar objetivo:",
          error,
        );

        if (
          error instanceof
          ApiError
        ) {
          setLoadError(
            error.message,
          );
        } else {
          setLoadError(
            "Não foi possível carregar o objetivo.",
          );
        }
      } finally {
        setIsLoading(
          false,
        );
      }
    }, [
      groupId,
      taskId,
      token,
    ]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  const currentMember =
    useMemo(() => {
      if (
        !group ||
        !currentUserId
      ) {
        return undefined;
      }

      return group.members.find(
        (member) =>
          getMemberUserId(
            member.user,
          ) ===
          currentUserId,
      );
    }, [
      group,
      currentUserId,
    ]);

  const isAdmin =
    currentMember?.role ===
    "admin";

  function openPicker(
    field: PickerField,
  ) {
    setPickerField(
      field,
    );
  }

  function closePicker() {
    setPickerField(
      null,
    );
  }

  function getPickerValue() {
    if (
      pickerField ===
        "deadlineDate" ||
      pickerField ===
        "deadlineTime"
    ) {
      return deadline;
    }

    return startsAt;
  }

  function getPickerMode():
    | "date"
    | "time" {
    if (
      pickerField ===
        "startTime" ||
      pickerField ===
        "deadlineTime"
    ) {
      return "time";
    }

    return "date";
  }

  function handlePickerChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    if (
      Platform.OS ===
      "android"
    ) {
      setPickerField(
        null,
      );
    }

    if (
      event.type ===
        "dismissed" ||
      !selectedDate
    ) {
      return;
    }

    switch (
      pickerField
    ) {
      case "startDate":
        setStartsAt(
          mergeDate(
            startsAt,
            selectedDate,
          ),
        );

        break;

      case "startTime":
        setStartsAt(
          mergeTime(
            startsAt,
            selectedDate,
          ),
        );

        break;

      case "deadlineDate":
        setDeadline(
          mergeDate(
            deadline,
            selectedDate,
          ),
        );

        break;

      case "deadlineTime":
        setDeadline(
          mergeTime(
            deadline,
            selectedDate,
          ),
        );

        break;
    }

    setFormError("");
  }

  function hasStartChanged() {
    if (!originalTask) {
      return false;
    }

    const originalStart =
      new Date(
        originalTask.startsAt,
      );

    return (
      originalStart.getTime() !==
      startsAt.getTime()
    );
  }

  function hasDeadlineChanged() {
    if (!originalTask) {
      return false;
    }

    const originalDeadline =
      new Date(
        originalTask.deadline,
      );

    return (
      originalDeadline.getTime() !==
      deadline.getTime()
    );
  }

  function validarFormulario() {
    if (!originalTask) {
      return "Objetivo não carregado.";
    }

    if (!title.trim()) {
      return "Digite um título para o objetivo.";
    }

    if (!points.trim()) {
      return "Informe quantos pontos o objetivo vale.";
    }

    const pointsNumber =
      Number(points);

    if (
      !Number.isInteger(
        pointsNumber,
      ) ||
      pointsNumber < 1
    ) {
      return "A pontuação deve ser um número inteiro maior que zero.";
    }

    /*
     * Só aplicamos a regra de
     * "não pode estar no passado"
     * se o início realmente tiver
     * sido alterado.
     *
     * Isso permite editar título,
     * descrição, pontos ou prazo
     * de um objetivo que já começou.
     */
    if (
      hasStartChanged()
    ) {
      const fiveMinutesAgo =
        Date.now() -
        5 * 60 * 1000;

      if (
        startsAt.getTime() <
        fiveMinutesAgo
      ) {
        return "O início do objetivo não pode ser alterado para uma data no passado.";
      }
    }

    if (
      startsAt.getTime() >=
      deadline.getTime()
    ) {
      return "O prazo final deve ser posterior ao início do objetivo.";
    }

    return "";
  }

  function buildUpdateData():
    UpdateTaskData {
    if (!originalTask) {
      return {};
    }

    const data:
      UpdateTaskData = {};

    const formattedTitle =
      title.trim();

    const formattedDescription =
      description.trim();

    const originalDescription =
      (
        originalTask.description ??
        ""
      ).trim();

    const pointsNumber =
      Number(points);

    if (
      formattedTitle !==
      originalTask.title.trim()
    ) {
      data.title =
        formattedTitle;
    }

    /*
     * Enviamos string vazia
     * quando o usuário remove
     * uma descrição existente.
     */
    if (
      formattedDescription !==
      originalDescription
    ) {
      data.description =
        formattedDescription;
    }

    if (
      pointsNumber !==
      originalTask.points
    ) {
      data.points =
        pointsNumber;
    }

    if (
      hasStartChanged()
    ) {
      data.startsAt =
        startsAt.toISOString();
    }

    if (
      hasDeadlineChanged()
    ) {
      data.deadline =
        deadline.toISOString();
    }

    return data;
  }

  async function handleUpdateTask() {
    if (
      !taskId ||
      !token ||
      !originalTask
    ) {
      return;
    }

    const validationError =
      validarFormulario();

    if (
      validationError
    ) {
      setFormError(
        validationError,
      );

      return;
    }

    const data =
      buildUpdateData();

    if (
      Object.keys(data)
        .length === 0
    ) {
      setFormError(
        "Nenhuma alteração foi feita.",
      );

      return;
    }

    try {
      setIsSubmitting(
        true,
      );

      setFormError("");

      const response =
        await taskService.updateTask(
          taskId,
          data,
          token,
        );

      setOriginalTask(
        response.task,
      );

      setShowSuccess(
        true,
      );
    } catch (error) {
      console.error(
        "Erro ao editar objetivo:",
        error,
      );

      if (
        error instanceof
        ApiError
      ) {
        setFormError(
          error.message,
        );
      } else {
        setFormError(
          "Não foi possível atualizar o objetivo.",
        );
      }
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  function goToObjectives() {
    if (!groupId) {
      router.replace(
        "/(main)/tabs/objetivos",
      );

      return;
    }

    router.replace({
      pathname:
        "/(main)/tabs/objetivos",

      params: {
        groupId,
      },
    });
  }

  /*
   * LOADING
   */

  if (isLoading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <ActivityIndicator
            size="large"
            color={
              UI.purpleBright
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Carregando objetivo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ERRO
   */

  if (
    loadError ||
    !group ||
    !originalTask
  ) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.stateHeader
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.centerState
          }
        >
          <View
            style={
              styles.errorStateIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={
                theme.error
              }
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Não foi possível
            continuar
          </Text>

          <Text
            style={
              styles.stateDescription
            }
          >
            {loadError ||
              "Objetivo não encontrado."}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={
              carregarDados
            }
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * PERMISSÃO
   */

  if (!isAdmin) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.stateHeader
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.centerState
          }
        >
          <View
            style={
              styles.permissionIcon
            }
          >
            <Ionicons
              name="shield-outline"
              size={30}
              color={
                UI.purpleSoft
              }
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Acesso restrito
          </Text>

          <Text
            style={
              styles.stateDescription
            }
          >
            Apenas administradores
            podem editar objetivos
            deste grupo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View
            style={
              styles.header
            }
          >
            <TouchableOpacity
              style={
                styles.backButton
              }
              activeOpacity={
                0.8
              }
              onPress={() =>
                router.back()
              }
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={
                  theme.textPrimary
                }
              />
            </TouchableOpacity>

            <View
              style={
                styles.headerCenter
              }
            >
              <Text
                style={
                  styles.headerTitle
                }
              >
                Editar objetivo
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
                numberOfLines={
                  1
                }
              >
                {group.name}
              </Text>
            </View>

            <View
              style={
                styles.headerPlaceholder
              }
            />
          </View>

          {/* HERO */}

          <LinearGradient
            colors={[
              "#332068",
              "#202A54",
              "#181E33",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.heroCard
            }
          >
            <View
              style={
                styles.heroIcon
              }
            >
              <Ionicons
                name="create-outline"
                size={24}
                color="#DDD5FF"
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.heroLabel
                }
              >
                EDITAR MISSÃO
              </Text>

              <Text
                style={
                  styles.heroTitle
                }
              >
                Ajuste o objetivo
              </Text>

              <Text
                style={
                  styles.heroDescription
                }
              >
                Altere as informações
                necessárias sem perder
                os dados atuais.
              </Text>
            </View>
          </LinearGradient>

          {/* INFORMAÇÕES */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Informações
          </Text>

          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Título
            </Text>

            <View
              style={
                styles.inputContainer
              }
            >
              <Ionicons
                name="flag-outline"
                size={19}
                color={
                  UI.purpleBright
                }
              />

              <TextInput
                value={title}
                onChangeText={(
                  value,
                ) => {
                  setTitle(
                    value,
                  );

                  setFormError(
                    "",
                  );
                }}
                placeholder="Título do objetivo"
                placeholderTextColor="#5F6A80"
                maxLength={100}
                style={
                  styles.input
                }
              />
            </View>

            <Text
              style={
                styles.characterHelper
              }
            >
              {title.length}
              /100
            </Text>
          </View>

          <View
            style={
              styles.fieldGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Descrição
              <Text
                style={
                  styles.optional
                }
              >
                {" "}
                · opcional
              </Text>
            </Text>

            <TextInput
              value={
                description
              }
              onChangeText={(
                value,
              ) => {
                setDescription(
                  value,
                );

                setFormError(
                  "",
                );
              }}
              multiline
              maxLength={300}
              textAlignVertical="top"
              placeholder="Descrição do objetivo..."
              placeholderTextColor="#5F6A80"
              style={
                styles.textArea
              }
            />

            <Text
              style={
                styles.characterHelper
              }
            >
              {
                description.length
              }
              /300
            </Text>
          </View>

          {/* PONTOS */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Recompensa
          </Text>

          <View
            style={
              styles.pointsCard
            }
          >
            <LinearGradient
              colors={[
                "#4B2FAC",
                "#354DD0",
              ]}
              style={
                styles.pointsIcon
              }
            >
              <Ionicons
                name="sparkles"
                size={22}
                color="#FFFFFF"
              />
            </LinearGradient>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.pointsTitle
                }
              >
                Pontos do objetivo
              </Text>

              <Text
                style={
                  styles.pointsDescription
                }
              >
                Recompensa recebida
                após uma evidência
                válida.
              </Text>
            </View>

            <View
              style={
                styles.pointsInputWrapper
              }
            >
              <TextInput
                value={points}
                onChangeText={(
                  value,
                ) => {
                  const onlyNumbers =
                    value.replace(
                      /[^0-9]/g,
                      "",
                    );

                  setPoints(
                    onlyNumbers,
                  );

                  setFormError(
                    "",
                  );
                }}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#5F6A80"
                maxLength={5}
                style={
                  styles.pointsInput
                }
              />

              <Text
                style={
                  styles.pointsSuffix
                }
              >
                pts
              </Text>
            </View>
          </View>

          {/* PERÍODO */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Período
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Você pode ajustar o período
            do objetivo. Se ele já tiver
            começado, o início original
            pode permanecer no passado.
          </Text>

          <View
            style={
              styles.dateCard
            }
          >
            <View
              style={
                styles.dateCardHeader
              }
            >
              <View
                style={
                  styles.dateIconBlue
                }
              >
                <Ionicons
                  name="play"
                  size={15}
                  color={
                    theme.primary
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.dateCardLabel
                  }
                >
                  INÍCIO
                </Text>

                <Text
                  style={
                    styles.dateCardTitle
                  }
                >
                  Disponível a partir
                  de
                </Text>
              </View>
            </View>

            <View
              style={
                styles.dateFields
              }
            >
              <DateField
                icon="calendar-outline"
                value={formatDate(
                  startsAt,
                )}
                onPress={() =>
                  openPicker(
                    "startDate",
                  )
                }
              />

              <DateField
                icon="time-outline"
                value={formatTime(
                  startsAt,
                )}
                onPress={() =>
                  openPicker(
                    "startTime",
                  )
                }
              />
            </View>
          </View>

          <View
            style={
              styles.timelineConnector
            }
          >
            <View
              style={
                styles.timelineDot
              }
            />

            <View
              style={
                styles.timelineLine
              }
            />

            <View
              style={
                styles.timelineDot
              }
            />
          </View>

          <View
            style={[
              styles.dateCard,
              styles.deadlineCard,
            ]}
          >
            <View
              style={
                styles.dateCardHeader
              }
            >
              <View
                style={
                  styles.dateIconPurple
                }
              >
                <Ionicons
                  name="flag"
                  size={15}
                  color={
                    UI.purpleBright
                  }
                />
              </View>

              <View>
                <Text
                  style={
                    styles.dateCardLabelPurple
                  }
                >
                  PRAZO FINAL
                </Text>

                <Text
                  style={
                    styles.dateCardTitle
                  }
                >
                  Encerramento da
                  missão
                </Text>
              </View>
            </View>

            <View
              style={
                styles.dateFields
              }
            >
              <DateField
                icon="calendar-outline"
                value={formatDate(
                  deadline,
                )}
                onPress={() =>
                  openPicker(
                    "deadlineDate",
                  )
                }
              />

              <DateField
                icon="time-outline"
                value={formatTime(
                  deadline,
                )}
                onPress={() =>
                  openPicker(
                    "deadlineTime",
                  )
                }
              />
            </View>
          </View>

          {/* ERRO */}

          {!!formError && (
            <View
              style={
                styles.formError
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={
                  theme.error
                }
              />

              <Text
                style={
                  styles.formErrorText
                }
              >
                {formError}
              </Text>
            </View>
          )}

          {/* SALVAR */}

          <TouchableOpacity
            activeOpacity={
              0.88
            }
            disabled={
              isSubmitting
            }
            onPress={
              handleUpdateTask
            }
            style={
              styles.saveButtonWrapper
            }
          >
            <LinearGradient
              colors={[
                "#6C4AF2",
                "#5272F2",
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={[
                styles.saveButton,

                isSubmitting &&
                  styles.saveButtonDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Salvar alterações
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text
            style={
              styles.securityHint
            }
          >
            Apenas administradores
            podem editar objetivos
            deste grupo.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DATE PICKER ANDROID */}

      {pickerField &&
        Platform.OS ===
          "android" && (
          <DateTimePicker
            value={
              getPickerValue()
            }
            mode={
              getPickerMode()
            }
            is24Hour
            onChange={
              handlePickerChange
            }
          />
        )}

      {/* DATE PICKER IOS */}

      {pickerField &&
        Platform.OS ===
          "ios" && (
          <Modal
            transparent
            animationType="fade"
            onRequestClose={
              closePicker
            }
          >
            <View
              style={
                styles.pickerOverlay
              }
            >
              <TouchableOpacity
                style={
                  StyleSheet.absoluteFillObject
                }
                activeOpacity={1}
                onPress={
                  closePicker
                }
              />

              <View
                style={
                  styles.pickerModal
                }
              >
                <View
                  style={
                    styles.pickerHeader
                  }
                >
                  <Text
                    style={
                      styles.pickerTitle
                    }
                  >
                    {getPickerMode() ===
                    "date"
                      ? "Selecionar data"
                      : "Selecionar horário"}
                  </Text>

                  <TouchableOpacity
                    onPress={
                      closePicker
                    }
                  >
                    <Text
                      style={
                        styles.pickerDone
                      }
                    >
                      Concluir
                    </Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={
                    getPickerValue()
                  }
                  mode={
                    getPickerMode()
                  }
                  display="spinner"
                  is24Hour
                  themeVariant="dark"
                  onChange={
                    handlePickerChange
                  }
                />
              </View>
            </View>
          </Modal>
        )}

      {/* SUCESSO */}

      <Modal
        visible={
          showSuccess
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowSuccess(
            false,
          )
        }
      >
        <View
          style={
            styles.successOverlay
          }
        >
          <View
            style={
              styles.successModal
            }
          >
            <LinearGradient
              colors={[
                "#4930A5",
                "#354CC7",
              ]}
              style={
                styles.successModalIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={30}
                color="#FFFFFF"
              />
            </LinearGradient>

            <Text
              style={
                styles.successModalTitle
              }
            >
              Objetivo atualizado!
            </Text>

            <Text
              style={
                styles.successModalDescription
              }
            >
              As alterações foram
              salvas com sucesso.
            </Text>

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.successPrimary
              }
              onPress={() => {
                setShowSuccess(
                  false,
                );

                goToObjectives();
              }}
            >
              <Text
                style={
                  styles.successPrimaryText
                }
              >
                Ver objetivos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={
                styles.successSecondary
              }
              onPress={() => {
                setShowSuccess(
                  false,
                );

                router.back();
              }}
            >
              <Text
                style={
                  styles.successSecondaryText
                }
              >
                Voltar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type DateFieldProps = {
  icon:
    React.ComponentProps<
      typeof Ionicons
    >["name"];

  value: string;

  onPress: () => void;
};

function DateField({
  icon,
  value,
  onPress,
}: DateFieldProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={
        styles.dateField
      }
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          theme.textSecondary
        }
      />

      <Text
        style={
          styles.dateFieldText
        }
      >
        {value}
      </Text>

      <Ionicons
        name="chevron-down"
        size={14}
        color="#647087"
      />
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        theme.background,
    },

    scrollContent: {
      paddingBottom: 45,
    },

    header: {
      minHeight: 64,

      paddingHorizontal: 20,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    headerCenter: {
      flex: 1,

      alignItems: "center",
    },

    headerTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,

      fontWeight: "800",
    },

    headerSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 10,

      maxWidth: 200,

      marginTop: 2,
    },

    headerPlaceholder: {
      width: 40,
    },

    backButton: {
      width: 40,
      height: 40,

      borderRadius: 13,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        UI.softSurface,

      borderWidth: 1,

      borderColor:
        UI.border,
    },

    stateHeader: {
      paddingHorizontal: 20,

      paddingTop: 10,
    },

    heroCard: {
      marginHorizontal: 20,

      marginTop: 8,

      padding: 18,

      borderRadius: 20,

      flexDirection: "row",

      alignItems: "center",

      gap: 13,

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.28)",
    },

    heroIcon: {
      width: 50,
      height: 50,

      borderRadius: 16,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.18)",
    },

    heroLabel: {
      color: "#A998FF",

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1.1,
    },

    heroTitle: {
      color: "#FFFFFF",

      fontSize: 16,

      fontWeight: "800",

      marginTop: 2,
    },

    heroDescription: {
      color: "#9AA5BD",

      fontSize: 10,

      lineHeight: 15,

      marginTop: 4,
    },

    sectionTitle: {
      marginHorizontal: 20,

      marginTop: 25,

      marginBottom: 10,

      color:
        theme.textPrimary,

      fontSize: 15,

      fontWeight: "800",
    },

    sectionDescription: {
      marginHorizontal: 20,

      marginTop: -4,

      marginBottom: 11,

      color:
        theme.textSecondary,

      fontSize: 10,

      lineHeight: 16,
    },

    fieldGroup: {
      marginHorizontal: 20,

      marginBottom: 16,
    },

    label: {
      color:
        theme.textSecondary,

      fontSize: 10,

      fontWeight: "700",

      marginBottom: 7,
    },

    optional: {
      color: "#606B80",

      fontWeight: "500",
    },

    inputContainer: {
      minHeight: 49,

      paddingHorizontal: 14,

      borderRadius: 14,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        UI.border,

      flexDirection: "row",

      alignItems: "center",

      gap: 10,
    },

    input: {
      flex: 1,

      color:
        theme.textPrimary,

      fontSize: 13,

      paddingVertical: 13,
    },

    textArea: {
      minHeight: 110,

      padding: 14,

      borderRadius: 14,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        UI.border,

      color:
        theme.textPrimary,

      fontSize: 12,

      lineHeight: 18,
    },

    characterHelper: {
      color: "#566176",

      fontSize: 8,

      textAlign: "right",

      marginTop: 5,
    },

    pointsCard: {
      marginHorizontal: 20,

      padding: 14,

      borderRadius: 17,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        UI.border,

      flexDirection: "row",

      alignItems: "center",

      gap: 12,
    },

    pointsIcon: {
      width: 45,
      height: 45,

      borderRadius: 14,

      alignItems: "center",

      justifyContent: "center",
    },

    pointsTitle: {
      color:
        theme.textPrimary,

      fontSize: 12,

      fontWeight: "800",
    },

    pointsDescription: {
      color:
        theme.textSecondary,

      fontSize: 9,

      lineHeight: 14,

      maxWidth: 145,

      marginTop: 3,
    },

    pointsInputWrapper: {
      height: 42,

      minWidth: 85,

      paddingHorizontal: 10,

      borderRadius: 12,

      backgroundColor:
        UI.purpleDark,

      borderWidth: 1,

      borderColor:
        "rgba(122,90,248,0.35)",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "flex-end",
    },

    pointsInput: {
      minWidth: 36,

      color:
        UI.purpleSoft,

      fontSize: 15,

      fontWeight: "900",

      textAlign: "right",
    },

    pointsSuffix: {
      color: "#9286BD",

      fontSize: 9,

      fontWeight: "700",

      marginLeft: 3,
    },

    dateCard: {
      marginHorizontal: 20,

      padding: 15,

      borderRadius: 17,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        UI.border,
    },

    deadlineCard: {
      borderColor:
        "rgba(122,90,248,0.28)",
    },

    dateCardHeader: {
      flexDirection: "row",

      alignItems: "center",

      gap: 10,

      marginBottom: 13,
    },

    dateIconBlue: {
      width: 34,
      height: 34,

      borderRadius: 11,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "rgba(82,114,242,0.12)",
    },

    dateIconPurple: {
      width: 34,
      height: 34,

      borderRadius: 11,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.15)",
    },

    dateCardLabel: {
      color:
        theme.primary,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 0.8,
    },

    dateCardLabelPurple: {
      color:
        UI.purpleBright,

      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 0.8,
    },

    dateCardTitle: {
      color:
        theme.textPrimary,

      fontSize: 12,

      fontWeight: "700",

      marginTop: 2,
    },

    dateFields: {
      flexDirection: "row",

      gap: 9,
    },

    dateField: {
      flex: 1,

      height: 44,

      paddingHorizontal: 11,

      borderRadius: 11,

      backgroundColor:
        theme.background,

      borderWidth: 1,

      borderColor:
        theme.border,

      flexDirection: "row",

      alignItems: "center",

      gap: 7,
    },

    dateFieldText: {
      flex: 1,

      color:
        theme.textPrimary,

      fontSize: 10,

      fontWeight: "600",
    },

    timelineConnector: {
      height: 25,

      marginLeft: 36,

      flexDirection:
        "column",

      alignItems: "center",

      width: 6,
    },

    timelineDot: {
      width: 4,
      height: 4,

      borderRadius: 2,

      backgroundColor:
        UI.purple,

      opacity: 0.45,
    },

    timelineLine: {
      flex: 1,

      width: 1,

      backgroundColor:
        UI.purple,

      opacity: 0.22,
    },

    formError: {
      marginHorizontal: 20,

      marginTop: 18,

      padding: 12,

      borderRadius: 12,

      backgroundColor:
        "rgba(239,68,68,0.07)",

      borderWidth: 1,

      borderColor:
        "rgba(239,68,68,0.16)",

      flexDirection: "row",

      alignItems: "center",

      gap: 8,
    },

    formErrorText: {
      flex: 1,

      color: "#F99898",

      fontSize: 10,

      lineHeight: 15,
    },

    saveButtonWrapper: {
      marginHorizontal: 20,

      marginTop: 24,

      borderRadius: 14,

      overflow: "hidden",
    },

    saveButton: {
      height: 50,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 8,

      borderRadius: 14,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color: "#FFFFFF",

      fontSize: 13,

      fontWeight: "900",
    },

    securityHint: {
      color: "#596479",

      fontSize: 9,

      textAlign: "center",

      marginTop: 10,
    },

    centerState: {
      flex: 1,

      paddingHorizontal: 35,

      alignItems: "center",

      justifyContent: "center",
    },

    loadingText: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 13,
    },

    errorStateIcon: {
      width: 58,
      height: 58,

      borderRadius: 19,

      backgroundColor:
        "rgba(239,68,68,0.08)",

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 13,
    },

    permissionIcon: {
      width: 58,
      height: 58,

      borderRadius: 19,

      backgroundColor:
        UI.purpleDark,

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 13,
    },

    stateTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      fontWeight: "800",
    },

    stateDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 18,

      textAlign: "center",

      maxWidth: 270,

      marginTop: 6,
    },

    retryButton: {
      height: 42,

      marginTop: 18,

      paddingHorizontal: 16,

      borderRadius: 12,

      backgroundColor:
        theme.primary,

      alignItems: "center",

      justifyContent: "center",
    },

    retryButtonText: {
      color: "#FFFFFF",

      fontSize: 11,

      fontWeight: "800",
    },

    pickerOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(4,7,14,0.75)",
    },

    pickerModal: {
      paddingBottom: 25,

      backgroundColor:
        theme.surface,

      borderTopLeftRadius: 22,

      borderTopRightRadius: 22,

      borderWidth: 1,

      borderColor:
        UI.border,
    },

    pickerHeader: {
      height: 55,

      paddingHorizontal: 18,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

      borderBottomColor:
        theme.border,
    },

    pickerTitle: {
      color:
        theme.textPrimary,

      fontSize: 14,

      fontWeight: "800",
    },

    pickerDone: {
      color:
        UI.purpleBright,

      fontSize: 13,

      fontWeight: "800",
    },

    successOverlay: {
      flex: 1,

      paddingHorizontal: 22,

      backgroundColor:
        "rgba(4,7,14,0.86)",

      alignItems: "center",

      justifyContent: "center",
    },

    successModal: {
      width: "100%",

      padding: 22,

      borderRadius: 22,

      backgroundColor:
        theme.surface,

      borderWidth: 1,

      borderColor:
        UI.border,

      alignItems: "center",
    },

    successModalIcon: {
      width: 62,
      height: 62,

      borderRadius: 20,

      alignItems: "center",

      justifyContent: "center",

      marginBottom: 15,
    },

    successModalTitle: {
      color:
        theme.textPrimary,

      fontSize: 20,

      fontWeight: "900",
    },

    successModalDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,

      lineHeight: 18,

      textAlign: "center",

      maxWidth: 270,

      marginTop: 7,

      marginBottom: 20,
    },

    successPrimary: {
      width: "100%",

      height: 46,

      borderRadius: 12,

      backgroundColor:
        UI.purpleBright,

      alignItems: "center",

      justifyContent: "center",
    },

    successPrimaryText: {
      color: "#FFFFFF",

      fontSize: 12,

      fontWeight: "900",
    },

    successSecondary: {
      width: "100%",

      height: 42,

      alignItems: "center",

      justifyContent: "center",

      marginTop: 6,
    },

    successSecondaryText: {
      color:
        theme.textSecondary,

      fontSize: 11,

      fontWeight: "700",
    },
  });