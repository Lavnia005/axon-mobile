import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
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

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  useRouter,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useAuth,
} from "@/contexts/AuthContext";

import {
  ApiError,
} from "@/services/api";

import {
  profileService,
} from "@/services/profileService";

import {
  ProfileUser,
} from "@/types/profile";

import {
  colors,
} from "@/theme";

const theme =
  colors.dark;

const UI = {
  blue: "#6687FF",
  blueSoft: "#AAB9FF",

  purple: "#8B6CFF",
  purpleSoft: "#C3B5FF",

  cyan: "#66E3F2",

  surface: "#151E30",
  surfaceRaised: "#1A2438",

  muted: "#7F899D",
};

/* =========================================================
   HELPERS
========================================================= */

function parseBirthDate(
  value?: string,
) {
  if (!value) {
    return new Date();
  }

  const datePart =
    value.split("T")[0];

  const [
    year,
    month,
    day,
  ] =
    datePart
      .split("-")
      .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return new Date();
  }

  return new Date(
    year,
    month - 1,
    day,
  );
}

function formatBirthDate(
  date: Date,
) {
  return date.toLocaleDateString(
    "pt-BR",
  );
}

function toApiDate(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText?:
    (value: string) => void;

  icon:
    keyof typeof Ionicons.glyphMap;

  placeholder?: string;

  editable?: boolean;

  keyboardType?:
    | "default"
    | "phone-pad"
    | "email-address";

  secureTextEntry?: boolean;

  rightElement?:
    React.ReactNode;
};

function InputField({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  editable = true,
  keyboardType = "default",
  secureTextEntry = false,
  rightElement,
}: InputFieldProps) {
  return (
    <View
      style={
        styles.fieldGroup
      }
    >
      <Text
        style={
          styles.fieldLabel
        }
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,

          !editable &&
            styles.inputDisabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            editable
              ? UI.blueSoft
              : UI.muted
          }
        />

        <TextInput
          style={
            styles.input
          }
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor={
            UI.muted
          }
          editable={
            editable
          }
          keyboardType={
            keyboardType
          }
          secureTextEntry={
            secureTextEntry
          }
          autoCapitalize={
            keyboardType ===
            "email-address"
              ? "none"
              : "sentences"
          }
        />

        {rightElement}
      </View>
    </View>
  );
}

/* =========================================================
   SCREEN
========================================================= */

export default function EditarPerfilScreen() {
  const router =
    useRouter();

  const {
    token,
  } =
    useAuth();

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileUser | null>(
      null,
    );

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    birthDate,
    setBirthDate,
  ] =
    useState(
      new Date(),
    );

  const [
    initialName,
    setInitialName,
  ] =
    useState("");

  const [
    initialPhone,
    setInitialPhone,
  ] =
    useState("");

  const [
    initialBirthDate,
    setInitialBirthDate,
  ] =
    useState("");

  const [
    showDatePicker,
    setShowDatePicker,
  ] =
    useState(false);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
  showPhotoModal,
  setShowPhotoModal,
] =
  useState(false);

  const [
    isUploadingPhoto,
    setIsUploadingPhoto,
  ] =
  useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] =
    useState(false);

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] =
    useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  const [
    passwordError,
    setPasswordError,
  ] =
    useState("");

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] =
    useState(false);

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    async function carregarPerfil() {
      if (!token) {
        setIsLoading(
          false,
        );

        return;
      }

      try {
        setError("");

        const response =
          await profileService.getProfile(
            token,
          );

        const user =
          response.user;

        setProfile(
          user,
        );

        setName(
          user.name,
        );

        setEmail(
          user.email,
        );

        setPhone(
          user.phone ?? "",
        );

        const parsedDate =
          parseBirthDate(
            user.birthDate,
          );

        setBirthDate(
          parsedDate,
        );

        setInitialName(
          user.name,
        );

        setInitialPhone(
          user.phone ?? "",
        );

        setInitialBirthDate(
          toApiDate(
            parsedDate,
          ),
        );
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error,
        );

        setError(
          error instanceof
          ApiError
            ? error.message
            : "Não foi possível carregar seus dados.",
        );
      } finally {
        setIsLoading(
          false,
        );
      }
    }

    void carregarPerfil();
  }, [token]);

  async function uploadProfilePhoto(
  asset:
    ImagePicker.ImagePickerAsset,
) {
  if (
    !token ||
    isUploadingPhoto
  ) {
    return;
  }

  try {
    setIsUploadingPhoto(
      true,
    );

    setError("");

    const response =
      await profileService.updateProfileImage(
        {
          uri:
            asset.uri,

          name:
            asset.fileName ??
            `profile-${Date.now()}.jpg`,

          type:
            asset.mimeType ??
            "image/jpeg",
        },
        token,
      );

    setProfile(
      (current) =>
        current
          ? {
              ...current,
              profileImage:
                response.profileImage,
            }
          : current,
    );

    setShowPhotoModal(
      false,
    );

    setSuccessMessage(
      "Foto de perfil atualizada com sucesso.",
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar foto:",
      error,
    );

    setShowPhotoModal(
      false,
    );

    setError(
      error instanceof
      ApiError
        ? error.message
        : "Não foi possível atualizar sua foto.",
    );
  } finally {
    setIsUploadingPhoto(
      false,
    );
  }
}

async function escolherFotoDaGaleria() {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (
    !permission.granted
  ) {
    setShowPhotoModal(
      false,
    );

    setError(
      "Permita o acesso às suas fotos para alterar a imagem de perfil.",
    );

    return;
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [
        "images",
      ],

      allowsEditing: true,

      aspect: [
        1,
        1,
      ],

      quality: 0.85,
    });

  if (
    result.canceled
  ) {
    return;
  }

  await uploadProfilePhoto(
    result.assets[0],
  );
}

async function tirarFotoPerfil() {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (
    !permission.granted
  ) {
    setShowPhotoModal(
      false,
    );

    setError(
      "Permita o acesso à câmera para tirar uma foto de perfil.",
    );

    return;
  }

  const result =
    await ImagePicker.launchCameraAsync({
      mediaTypes: [
        "images",
      ],

      allowsEditing: true,

      aspect: [
        1,
        1,
      ],

      quality: 0.85,
    });

  if (
    result.canceled
  ) {
    return;
  }

  await uploadProfilePhoto(
    result.assets[0],
  );
}

  /* =======================================================
     DATE
  ======================================================= */

  function handleDateChange(
    event:
      DateTimePickerEvent,
    selectedDate?:
      Date,
  ) {
    if (
      Platform.OS ===
      "android"
    ) {
      setShowDatePicker(
        false,
      );
    }

    if (
      event.type ===
        "set" &&
      selectedDate
    ) {
      setBirthDate(
        selectedDate,
      );
    }
  }

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  async function handleSave() {
    if (
      !token ||
      !profile
    ) {
      return;
    }

    const normalizedName =
      name.trim();

    const normalizedPhone =
      phone.trim();

    if (!normalizedName) {
      setError(
        "Informe seu nome.",
      );

      return;
    }

    if (!normalizedPhone) {
      setError(
        "Informe seu telefone.",
      );

      return;
    }

    const birthDateApi =
      toApiDate(
        birthDate,
      );

    const changedData: {
      name?: string;
      phone?: string;
      birthDate?: string;
    } = {};

    if (
      normalizedName !==
      initialName
    ) {
      changedData.name =
        normalizedName;
    }

    if (
      normalizedPhone !==
      initialPhone
    ) {
      changedData.phone =
        normalizedPhone;
    }

    if (
      birthDateApi !==
      initialBirthDate
    ) {
      changedData.birthDate =
        birthDateApi;
    }

    if (
      Object.keys(
        changedData,
      ).length === 0
    ) {
      setError(
        "Nenhuma alteração foi feita.",
      );

      return;
    }

    try {
      setIsSaving(
        true,
      );

      setError("");

      const response =
        await profileService.updateProfile(
          changedData,
          token,
        );

      setProfile(
        response.user,
      );

      setInitialName(
        response.user.name,
      );

      setInitialPhone(
        response.user.phone ??
          "",
      );

      setInitialBirthDate(
        toApiDate(
          parseBirthDate(
            response.user.birthDate,
          ),
        ),
      );

      setSuccessMessage(
        "Perfil atualizado com sucesso.",
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error,
      );

      setError(
        error instanceof
        ApiError
          ? error.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }

  /* =======================================================
     PASSWORD
  ======================================================= */

  function closePasswordModal() {
    setShowPasswordModal(
      false,
    );

    setCurrentPassword(
      "",
    );

    setNewPassword(
      "",
    );

    setConfirmPassword(
      "",
    );

    setPasswordError(
      "",
    );

    setShowCurrentPassword(
      false,
    );

    setShowNewPassword(
      false,
    );

    setShowConfirmPassword(
      false,
    );
  }

  async function handleChangePassword() {
    if (!token) {
      return;
    }

    setPasswordError(
      "",
    );

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Preencha todos os campos.",
      );

      return;
    }

    if (
      newPassword.length <
      8
    ) {
      setPasswordError(
        "A nova senha deve ter pelo menos 8 caracteres.",
      );

      return;
    }

    const hasUppercase =
      /[A-Z]/.test(
        newPassword,
      );

    const hasLowercase =
      /[a-z]/.test(
        newPassword,
      );

    const hasNumber =
      /\d/.test(
        newPassword,
      );

    if (
      !hasUppercase ||
      !hasLowercase ||
      !hasNumber
    ) {
      setPasswordError(
        "Use pelo menos uma letra maiúscula, uma minúscula e um número.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "As novas senhas não coincidem.",
      );

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setPasswordError(
        "A nova senha deve ser diferente da senha atual.",
      );

      return;
    }

    try {
      setIsChangingPassword(
        true,
      );

      await profileService.changePassword(
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        token,
      );

      closePasswordModal();

      setSuccessMessage(
        "Senha alterada com sucesso.",
      );
    } catch (error) {
      console.error(
        "Erro ao alterar senha:",
        error,
      );

      setPasswordError(
        error instanceof
        ApiError
          ? error.message
          : "Não foi possível alterar sua senha.",
      );
    } finally {
      setIsChangingPassword(
        false,
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

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
            color={
              UI.purpleSoft
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Carregando dados...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     CONTENT
  ======================================================= */

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
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            activeOpacity={
              0.75
            }
            style={
              styles.headerButton
            }
            onPress={() =>
              router.replace(
                "/(main)/tabs/perfil",
              )
            }
          >
            <Ionicons
              name="close"
              size={23}
              color={
                theme.textPrimary
              }
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Editar perfil
          </Text>

          <View
            style={
              styles.headerButton
            }
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          {/* INTRO */}

          <View
            style={
              styles.intro
            }
          >
            <Text
              style={
                styles.introTitle
              }
            >
              Seus dados
            </Text>

            <Text
              style={
                styles.introDescription
              }
            >
              Mantenha suas informações
              pessoais atualizadas.
            </Text>
          </View>

          {/* FOTO */}

<View
  style={
    styles.photoSection
  }
>
  <View
    style={
      styles.photoWrapper
    }
  >
    <View
      style={
        styles.photoBorder
      }
    >
      {profile?.profileImage ? (
        <Image
          source={{
            uri:
              profile.profileImage,
          }}
          style={
            styles.profilePhoto
          }
        />
      ) : (
        <View
          style={
            styles.photoFallback
          }
        >
          <Ionicons
            name="person-outline"
            size={34}
            color={
              UI.blueSoft
            }
          />
        </View>
      )}
    </View>

    <TouchableOpacity
      activeOpacity={
        0.8
      }
      disabled={
        isUploadingPhoto
      }
      style={
        styles.photoEditButton
      }
      onPress={() =>
        setShowPhotoModal(
          true,
        )
      }
    >
      {isUploadingPhoto ? (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
        />
      ) : (
        <Ionicons
          name="pencil"
          size={16}
          color="#FFFFFF"
        />
      )}
    </TouchableOpacity>
  </View>

  <Text
    style={
      styles.photoActionText
    }
  >
    {profile?.profileImage
      ? "Alterar foto"
      : "Adicionar foto"}
  </Text>
</View>

          {/* ERROR */}

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={
                  theme.error
                }
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* DATA */}

          <View
            style={
              styles.formCard
            }
          >
            <InputField
              label="Nome"
              icon="person-outline"
              value={name}
              onChangeText={
                setName
              }
              placeholder="Seu nome"
            />

            <InputField
              label="E-mail"
              icon="mail-outline"
              value={email}
              editable={false}
              keyboardType="email-address"
            />

            <Text
              style={
                styles.emailHint
              }
            >
              O e-mail não pode ser alterado.
            </Text>

            <InputField
              label="Telefone"
              icon="call-outline"
              value={phone}
              onChangeText={
                setPhone
              }
              keyboardType="phone-pad"
              placeholder="Seu telefone"
            />

            <View
              style={
                styles.fieldGroup
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                Data de nascimento
              </Text>

              <TouchableOpacity
                activeOpacity={
                  0.8
                }
                style={
                  styles.dateButton
                }
                onPress={() =>
                  setShowDatePicker(
                    true,
                  )
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={
                    UI.blueSoft
                  }
                />

                <Text
                  style={
                    styles.dateText
                  }
                >
                  {formatBirthDate(
                    birthDate,
                  )}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={
                    UI.muted
                  }
                />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={
                  birthDate
                }
                mode="date"
                display={
                  Platform.OS ===
                  "ios"
                    ? "spinner"
                    : "default"
                }
                maximumDate={
                  new Date()
                }
                onChange={
                  handleDateChange
                }
              />
            )}
          </View>

          {/* SECURITY */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Segurança
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Gerencie sua senha de acesso
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={
              0.82
            }
            style={
              styles.passwordCard
            }
            onPress={() =>
              setShowPasswordModal(
                true,
              )
            }
          >
            <View
              style={
                styles.passwordIcon
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={
                  UI.purpleSoft
                }
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.passwordTitle
                }
              >
                Alterar senha
              </Text>

              <Text
                style={
                  styles.passwordDescription
                }
              >
                Atualize sua senha de acesso
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                UI.muted
              }
            />
          </TouchableOpacity>

          {/* SAVE */}

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            disabled={
              isSaving
            }
            style={[
              styles.saveButton,

              isSaving &&
                styles.saveButtonDisabled,
            ]}
            onPress={() =>
              void handleSave()
            }
          >
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={19}
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
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PHOTO MODAL */}

<Modal
  transparent
  animationType="fade"
  visible={
    showPhotoModal
  }
  statusBarTranslucent
  onRequestClose={() =>
    setShowPhotoModal(
      false,
    )
  }
>
  <View
    style={
      styles.modalOverlay
    }
  >
    <View
      style={
        styles.photoModalCard
      }
    >
      <View
        style={
          styles.photoModalHeader
        }
      >
        <View
          style={
            styles.photoModalIcon
          }
        >
          <Ionicons
            name="image-outline"
            size={21}
            color={
              UI.purpleSoft
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.photoModalTitle
            }
          >
            Foto de perfil
          </Text>

          <Text
            style={
              styles.photoModalSubtitle
            }
          >
            Escolha como deseja adicionar sua foto
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            setShowPhotoModal(
              false,
            )
          }
        >
          <Ionicons
            name="close"
            size={22}
            color={
              theme.textSecondary
            }
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={
          0.82
        }
        style={
          styles.photoOption
        }
        onPress={() =>
          void escolherFotoDaGaleria()
        }
      >
        <View
          style={
            styles.photoOptionIcon
          }
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={
              UI.blueSoft
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.photoOptionTitle
            }
          >
            Escolher da galeria
          </Text>

          <Text
            style={
              styles.photoOptionDescription
            }
          >
            Use uma foto que já está no celular
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            UI.muted
          }
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={
          0.82
        }
        style={
          styles.photoOption
        }
        onPress={() =>
          void tirarFotoPerfil()
        }
      >
        <View
          style={
            styles.photoOptionIcon
          }
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={
              UI.purpleSoft
            }
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.photoOptionTitle
            }
          >
            Tirar uma foto
          </Text>

          <Text
            style={
              styles.photoOptionDescription
            }
          >
            Abra a câmera e registre agora
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            UI.muted
          }
        />
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      {/* PASSWORD MODAL */}

      <Modal
        transparent
        animationType="fade"
        visible={
          showPasswordModal
        }
        statusBarTranslucent
        onRequestClose={
          closePasswordModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalIcon
                }
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={21}
                  color={
                    UI.purpleSoft
                  }
                />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Alterar senha
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Confirme sua senha atual
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  closePasswordModal
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={
                    theme.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <View
                style={
                  styles.passwordErrorBox
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={
                    theme.error
                  }
                />

                <Text
                  style={
                    styles.passwordErrorText
                  }
                >
                  {passwordError}
                </Text>
              </View>
            ) : null}

            <InputField
              label="Senha atual"
              icon="key-outline"
              value={
                currentPassword
              }
              onChangeText={
                setCurrentPassword
              }
              secureTextEntry={
                !showCurrentPassword
              }
              rightElement={
                <TouchableOpacity
                  onPress={() =>
                    setShowCurrentPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                >
                  <Ionicons
                    name={
                      showCurrentPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={19}
                    color={
                      UI.muted
                    }
                  />
                </TouchableOpacity>
              }
            />

            <InputField
              label="Nova senha"
              icon="lock-closed-outline"
              value={
                newPassword
              }
              onChangeText={
                setNewPassword
              }
              secureTextEntry={
                !showNewPassword
              }
              rightElement={
                <TouchableOpacity
                  onPress={() =>
                    setShowNewPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                >
                  <Ionicons
                    name={
                      showNewPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={19}
                    color={
                      UI.muted
                    }
                  />
                </TouchableOpacity>
              }
            />

            <InputField
              label="Confirmar nova senha"
              icon="shield-checkmark-outline"
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry={
                !showConfirmPassword
              }
              rightElement={
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={19}
                    color={
                      UI.muted
                    }
                  />
                </TouchableOpacity>
              }
            />

            <Text
              style={
                styles.passwordRule
              }
            >
              Mínimo de 8 caracteres,
              com maiúscula, minúscula e número.
            </Text>

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              disabled={
                isChangingPassword
              }
              style={[
                styles.changePasswordButton,

                isChangingPassword &&
                  styles.saveButtonDisabled,
              ]}
              onPress={() =>
                void handleChangePassword()
              }
            >
              {isChangingPassword ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.changePasswordButtonText
                  }
                >
                  Atualizar senha
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SUCCESS MODAL */}

      <Modal
        transparent
        animationType="fade"
        visible={
          Boolean(
            successMessage,
          )
        }
        statusBarTranslucent
        onRequestClose={() =>
          setSuccessMessage(
            "",
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.successCard
            }
          >
            <View
              style={
                styles.successIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={26}
                color={
                  UI.cyan
                }
              />
            </View>

            <Text
              style={
                styles.successTitle
              }
            >
              Tudo certo
            </Text>

            <Text
              style={
                styles.successDescription
              }
            >
              {successMessage}
            </Text>

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.successButton
              }
              onPress={() => {
                setSuccessMessage(
                  "",
                );

                router.replace(
                  "/(main)/tabs/perfil",
                );
              }}
            >
              <Text
                style={
                  styles.successButtonText
                }
              >
                Concluir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        theme.background,
    },

    /* HEADER */

    header: {
      height: 58,

      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",

      paddingHorizontal: 18,
    },

    headerButton: {
      width: 38,
      height: 38,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,
      fontWeight: "800",
    },

    content: {
      paddingHorizontal: 18,

      paddingTop: 10,
      paddingBottom: 55,
    },

    /* INTRO */

    intro: {
      marginBottom: 20,
    },

    introTitle: {
      color:
        theme.textPrimary,

      fontSize: 22,
      fontWeight: "800",

      letterSpacing: -0.4,
    },

    introDescription: {
      color:
        theme.textSecondary,

      fontSize: 11,
      lineHeight: 17,

      marginTop: 5,
    },

    /* PHOTO */

photoSection: {
  alignItems: "center",

  marginBottom: 23,
},

photoWrapper: {
  position: "relative",
},

photoBorder: {
  width: 104,
  height: 104,

  borderRadius: 52,

  padding: 3,

  backgroundColor:
    "rgba(102,135,255,0.14)",

  borderWidth: 1,

  borderColor:
    "rgba(139,108,255,0.42)",
},

profilePhoto: {
  width: "100%",
  height: "100%",

  borderRadius: 49,
},

photoFallback: {
  flex: 1,

  borderRadius: 49,

  alignItems: "center",
  justifyContent: "center",

  backgroundColor:
    "#202B45",
},

photoEditButton: {
  position: "absolute",

  right: -2,
  bottom: 3,

  width: 33,
  height: 33,

  borderRadius: 17,

  alignItems: "center",
  justifyContent: "center",

  backgroundColor:
    theme.primary,

  borderWidth: 3,

  borderColor:
    theme.background,
},

photoActionText: {
  color:
    UI.blueSoft,

  fontSize: 10,

  fontWeight: "700",

  marginTop: 9,
},

    /* FORM */

    formCard: {
      padding: 15,

      borderRadius: 21,

      backgroundColor:
        UI.surface,

      borderWidth: 1,

      borderColor:
        theme.border,

      marginBottom: 27,
    },

    fieldGroup: {
      marginBottom: 17,
    },

    fieldLabel: {
      color:
        theme.textSecondary,

      fontSize: 10,
      fontWeight: "600",

      marginBottom: 7,
      marginLeft: 2,
    },

    inputContainer: {
      minHeight: 52,

      flexDirection: "row",
      alignItems: "center",

      gap: 10,

      paddingHorizontal: 13,

      borderRadius: 15,

      backgroundColor:
        UI.surfaceRaised,

      borderWidth: 1,

      borderColor:
        "rgba(102,135,255,0.13)",
    },

    inputDisabled: {
      opacity: 0.58,
    },

    input: {
      flex: 1,

      color:
        theme.textPrimary,

      fontSize: 13,

      paddingVertical: 13,
    },

    emailHint: {
      color:
        UI.muted,

      fontSize: 8,

      marginTop: -10,
      marginBottom: 17,
      marginLeft: 3,
    },

    dateButton: {
      minHeight: 52,

      flexDirection: "row",
      alignItems: "center",

      gap: 10,

      paddingHorizontal: 13,

      borderRadius: 15,

      backgroundColor:
        UI.surfaceRaised,

      borderWidth: 1,

      borderColor:
        "rgba(102,135,255,0.13)",
    },

    dateText: {
      flex: 1,

      color:
        theme.textPrimary,

      fontSize: 13,
    },

    /* ERROR */

    errorBox: {
      flexDirection: "row",
      alignItems: "center",

      gap: 8,

      padding: 12,

      borderRadius: 14,

      backgroundColor:
        "rgba(239,68,68,0.07)",

      borderWidth: 1,

      borderColor:
        "rgba(239,68,68,0.15)",

      marginBottom: 15,
    },

    errorText: {
      flex: 1,

      color:
        "#FF9999",

      fontSize: 10,
      lineHeight: 15,
    },

    /* SECURITY */

    sectionHeader: {
      marginBottom: 11,
    },

    sectionTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,
      fontWeight: "800",
    },

    sectionSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 3,
    },

    passwordCard: {
      minHeight: 68,

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 14,

      borderRadius: 18,

      backgroundColor:
        "rgba(139,108,255,0.055)",

      borderWidth: 1,

      borderColor:
        "rgba(139,108,255,0.16)",

      marginBottom: 27,
    },

    passwordIcon: {
      width: 39,
      height: 39,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.10)",

      marginRight: 11,
    },

    passwordTitle: {
      color:
        theme.textPrimary,

      fontSize: 13,

      fontWeight: "700",
    },

    passwordDescription: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 3,
    },

    /* SAVE */

    saveButton: {
      height: 52,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 8,

      borderRadius: 16,

      backgroundColor:
        theme.primary,
    },

    saveButtonDisabled: {
      opacity: 0.55,
    },

    saveButtonText: {
      color:
        "#FFFFFF",

      fontSize: 13,

      fontWeight: "800",
    },

    /* STATES */

    centerState: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      color:
        theme.textSecondary,

      fontSize: 11,

      marginTop: 10,
    },

    /* MODAL */

    modalOverlay: {
      flex: 1,

      justifyContent: "center",

      paddingHorizontal: 20,

      backgroundColor:
        "rgba(4,7,14,0.80)",
    },

    modalCard: {
      borderRadius: 23,

      padding: 19,

      backgroundColor:
        "#171E2E",

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",

      gap: 11,

      marginBottom: 18,
    },

    modalIcon: {
      width: 41,
      height: 41,

      borderRadius: 13,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(139,108,255,0.10)",
    },

    modalTitle: {
      color:
        theme.textPrimary,

      fontSize: 16,

      fontWeight: "800",
    },

    modalSubtitle: {
      color:
        theme.textSecondary,

      fontSize: 9,

      marginTop: 2,
    },

    passwordErrorBox: {
      flexDirection: "row",

      gap: 7,

      padding: 11,

      borderRadius: 13,

      backgroundColor:
        "rgba(239,68,68,0.07)",

      marginBottom: 15,
    },

    passwordErrorText: {
      flex: 1,

      color:
        "#FF9999",

      fontSize: 9,

      lineHeight: 14,
    },

    passwordRule: {
      color:
        UI.muted,

      fontSize: 8,

      lineHeight: 13,

      marginTop: -4,
      marginBottom: 16,
    },

    changePasswordButton: {
      height: 48,

      alignItems: "center",
      justifyContent: "center",

      borderRadius: 14,

      backgroundColor:
        theme.primary,
    },

    changePasswordButtonText: {
      color:
        "#FFFFFF",

      fontSize: 12,

      fontWeight: "800",
    },
    photoModalCard: {
  padding: 19,

  borderRadius: 23,

  backgroundColor:
    "#171E2E",

  borderWidth: 1,

  borderColor:
    theme.border,
},

photoModalHeader: {
  flexDirection: "row",
  alignItems: "center",

  gap: 11,

  marginBottom: 17,
},

photoModalIcon: {
  width: 41,
  height: 41,

  borderRadius: 13,

  alignItems: "center",
  justifyContent: "center",

  backgroundColor:
    "rgba(139,108,255,0.10)",
},

photoModalTitle: {
  color:
    theme.textPrimary,

  fontSize: 16,

  fontWeight: "800",
},

photoModalSubtitle: {
  color:
    theme.textSecondary,

  fontSize: 9,

  marginTop: 2,
},

photoOption: {
  minHeight: 67,

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 12,

  borderRadius: 16,

  backgroundColor:
    UI.surfaceRaised,

  borderWidth: 1,

  borderColor:
    theme.border,

  marginTop: 9,
},

photoOptionIcon: {
  width: 39,
  height: 39,

  borderRadius: 12,

  alignItems: "center",
  justifyContent: "center",

  backgroundColor:
    "rgba(102,135,255,0.07)",

  marginRight: 11,
},

photoOptionTitle: {
  color:
    theme.textPrimary,

  fontSize: 12,

  fontWeight: "700",
},

photoOptionDescription: {
  color:
    theme.textSecondary,

  fontSize: 8,

  marginTop: 3,
},

    /* SUCCESS */

    successCard: {
      alignItems: "center",

      padding: 21,

      borderRadius: 23,

      backgroundColor:
        "#171E2E",

      borderWidth: 1,

      borderColor:
        theme.border,
    },

    successIcon: {
      width: 53,
      height: 53,

      borderRadius: 18,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(98,229,244,0.07)",

      marginBottom: 13,
    },

    successTitle: {
      color:
        theme.textPrimary,

      fontSize: 17,

      fontWeight: "800",
    },

    successDescription: {
      color:
        theme.textSecondary,

      fontSize: 10,
      lineHeight: 16,

      textAlign: "center",

      marginTop: 6,
    },

    successButton: {
      width: "100%",

      height: 46,

      alignItems: "center",
      justifyContent: "center",

      borderRadius: 14,

      backgroundColor:
        theme.primary,

      marginTop: 18,
    },

    successButtonText: {
      color:
        "#FFFFFF",

      fontSize: 12,

      fontWeight: "800",
    },
  });