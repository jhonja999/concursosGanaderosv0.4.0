"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  ImageIcon,
  X,
  Save,
  LinkIcon,
  FileImage,
  AlertCircle,
  Check,
  Camera,
  Loader2,
  RotateCcw,
  RefreshCw,
  FlipHorizontal,
  Smartphone,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { DuplicateImageDialog } from "./duplicate-image-dialog";

interface CloudinaryUploadProps {
  value?: string;
  onChange?: (url: string, publicId?: string) => void;
  onSuccess?: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  alt?: string;
  caption?: string;
  className?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  maxFiles?: number;
  disabled?: boolean;
  acceptedFormats?: string[];
}

interface PreviewFile {
  file: File;
  preview: string;
  name: string;
  size: string;
  type: string;
}

interface CameraDevice {
  deviceId: string;
  label: string;
  facingMode?: string;
}

interface ExistingImageInfo {
  exists: boolean;
  image?: any;
  filename?: string;
  uploadedAt?: string;
  size?: number;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const formatUploadDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const validateFile = (
  file: File,
  acceptedFormats: string[]
): { isValid: boolean; error?: string } => {
  const allowedTypes = acceptedFormats.map((format) => `image/${format}`);
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no válido. Solo se permiten: ${acceptedFormats
        .join(", ")
        .toUpperCase()}`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 10MB",
    };
  }

  return { isValid: true };
};

export const CloudinaryUpload = React.memo(function CloudinaryUpload({
  value,
  onChange,
  onSuccess,
  folder = "uploads",
  label = "Imagen",
  description = "Sube una imagen",
  entityType,
  entityId,
  alt,
  caption,
  className = "",
  resourceType = "image",
  maxFiles = 1,
  disabled = false,
  acceptedFormats = ["jpg", "jpeg", "png", "gif", "webp"],
}: CloudinaryUploadProps) {
  // Core upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Camera states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">(
    "environment"
  );
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Duplicate detection states
  const [existingImage, setExistingImage] = useState<ExistingImageInfo | null>(
    null
  );
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized values
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  // Enhanced camera cleanup
  const cleanupCamera = useCallback(async () => {
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      setCameraStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Wait for camera to be fully released
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [cameraStream]);

  // Check existing image function
  const checkExistingImage = useCallback(
    async (filename: string) => {
      setIsCheckingDuplicate(true);
      try {
        const response = await fetch("/api/upload/check-existing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename,
            folder,
            entityType,
          }),
        });

        if (response.ok) {
          const existingInfo: ExistingImageInfo = await response.json();
          setExistingImage(existingInfo);

          if (existingInfo.exists) {
            setShowDuplicateDialog(true);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error("Error checking existing image:", error);
        return false;
      } finally {
        setIsCheckingDuplicate(false);
      }
    },
    [folder, entityType]
  );

  // Create preview function
  const createPreview = useCallback(
    async (file: File) => {
      const validation = validateFile(file, acceptedFormats);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      const preview = URL.createObjectURL(file);
      const newPreviewFile = {
        file,
        preview,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      };

      setPreviewFile(newPreviewFile);
      await checkExistingImage(file.name);
    },
    [acceptedFormats, checkExistingImage]
  );

  // File selection handler
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      createPreview(file);
    },
    [createPreview]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  // Upload functions
  const uploadFile = useCallback(
    async (file: File, forceOverwrite = false) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("forceOverwrite", forceOverwrite.toString());
      if (entityType) formData.append("entityType", entityType);
      if (entityId) formData.append("entityId", entityId);
      if (alt) formData.append("alt", alt);
      if (caption) formData.append("caption", caption);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      return response.json();
    },
    [folder, entityType, entityId, alt, caption]
  );

  const uploadFromUrl = useCallback(
    async (url: string, forceOverwrite = false) => {
      const formData = new FormData();
      formData.append("imageUrl", url);
      formData.append("folder", folder);
      formData.append("forceOverwrite", forceOverwrite.toString());
      if (entityType) formData.append("entityType", entityType);
      if (entityId) formData.append("entityId", entityId);
      if (alt) formData.append("alt", alt);
      if (caption) formData.append("caption", caption);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen desde URL");
      }

      return response.json();
    },
    [folder, entityType, entityId, alt, caption]
  );

  // Upload handlers
  const handleUseExisting = useCallback(() => {
    if (existingImage?.image?.secure_url) {
      const url = existingImage.image.secure_url;
      const publicId = existingImage.image.public_id;

      onChange?.(url, publicId);
      onSuccess?.(url, publicId);
      toast.success("Imagen existente seleccionada");

      setShowDuplicateDialog(false);
      setExistingImage(null);
      if (previewFile) {
        URL.revokeObjectURL(previewFile.preview);
        setPreviewFile(null);
      }
    }
  }, [existingImage, onChange, onSuccess, previewFile]);

  const handleOverwrite = useCallback(async () => {
    if (!previewFile) return;

    setShowDuplicateDialog(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(previewFile.file, true);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange?.(result.url, result.publicId);
      onSuccess?.(result.url, result.publicId);
      toast.success("Imagen sobrescrita exitosamente");

      URL.revokeObjectURL(previewFile.preview);
      setPreviewFile(null);
      setExistingImage(null);
    } catch (error) {
      console.error("Error overwriting file:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al sobrescribir la imagen"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [previewFile, uploadFile, onChange, onSuccess]);

  const handleUploadNew = useCallback(async () => {
    if (!previewFile) return;

    setShowDuplicateDialog(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(previewFile.file, false);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange?.(result.url, result.publicId);
      onSuccess?.(result.url, result.publicId);
      toast.success("Nueva imagen subida exitosamente");

      URL.revokeObjectURL(previewFile.preview);
      setPreviewFile(null);
      setExistingImage(null);
    } catch (error) {
      console.error("Error uploading new file:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al subir la nueva imagen"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [previewFile, uploadFile, onChange, onSuccess]);

  const handleSaveFile = useCallback(async () => {
    if (!previewFile || existingImage?.exists) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(previewFile.file, false);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange?.(result.url, result.publicId);
      onSuccess?.(result.url, result.publicId);
      toast.success("Imagen subida exitosamente");

      URL.revokeObjectURL(previewFile.preview);
      setPreviewFile(null);
      setExistingImage(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al subir la imagen"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [previewFile, existingImage, uploadFile, onChange, onSuccess]);

  const handleSaveUrl = useCallback(async () => {
    if (!imageUrl.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFromUrl(imageUrl, false);

      clearInterval(progressInterval);
      setUploadProgress(100);

      onChange?.(result.url, result.publicId);
      onSuccess?.(result.url, result.publicId);
      toast.success("Imagen subida exitosamente desde URL");

      setImageUrl("");
    } catch (error) {
      console.error("Error uploading from URL:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al subir la imagen desde URL"
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [imageUrl, uploadFromUrl, onChange, onSuccess]);

  const handleCancelPreview = useCallback(() => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile.preview);
      setPreviewFile(null);
    }
    setExistingImage(null);
    setShowDuplicateDialog(false);
  }, [previewFile]);

  const handleRemoveImage = useCallback(() => {
    onChange?.("");
    onSuccess?.("");
    toast.success("Imagen eliminada");
  }, [onChange, onSuccess]);

  // Camera functions
  const getAvailableCameras = useCallback(async () => {
    try {
      setIsLoadingCameras(true);
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("La enumeración de dispositivos no es compatible");
      }

      // Request permissions first
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        tempStream.getTracks().forEach((track) => track.stop());
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(
          "Could not get temporary stream for device enumeration:",
          e
        );
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        throw new Error("No se encontraron cámaras en este dispositivo");
      }

      const cameras: CameraDevice[] = videoDevices.map((device, index) => {
        const label = device.label || `Cámara ${index + 1}`;
        let facingMode = "unknown";

        const labelLower = label.toLowerCase();
        if (
          labelLower.includes("front") ||
          labelLower.includes("user") ||
          labelLower.includes("frontal")
        ) {
          facingMode = "user";
        } else if (
          labelLower.includes("back") ||
          labelLower.includes("rear") ||
          labelLower.includes("environment") ||
          labelLower.includes("trasera")
        ) {
          facingMode = "environment";
        }

        return {
          deviceId: device.deviceId,
          label: label,
          facingMode: facingMode,
        };
      });

      setAvailableCameras(cameras);

      if (cameras.length > 0 && !selectedCamera) {
        const preferredCamera = isMobile
          ? cameras.find((cam) => cam.facingMode === "environment") ||
            cameras[0]
          : cameras.find((cam) => cam.facingMode === "user") || cameras[0];

        setSelectedCamera(preferredCamera.deviceId);
      }

      return cameras;
    } catch (error) {
      console.error("Error getting cameras:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudieron detectar las cámaras disponibles";
      setCameraError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoadingCameras(false);
    }
  }, [selectedCamera, isMobile]);

  const startCamera = useCallback(
    async (deviceId?: string, useBasicConfig = false) => {
      try {
        setCameraError(null);
        setIsSwitchingCamera(true);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("La cámara no es compatible con este navegador");
        }

        // Cleanup previous camera
        await cleanupCamera();

        let constraints: MediaStreamConstraints;

        if (useBasicConfig) {
          // Basic configuration for problematic cameras
          constraints = {
            audio: false,
            video: deviceId
              ? { deviceId: { exact: deviceId } }
              : {
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  frameRate: { ideal: 15 },
                },
          };
        } else {
          // Advanced configuration
          constraints = {
            audio: false,
            video: deviceId
              ? {
                  deviceId: { exact: deviceId },
                  width: { ideal: 1280, max: 1920 },
                  height: { ideal: 720, max: 1080 },
                  frameRate: { ideal: 30, max: 60 },
                }
              : {
                  width: { ideal: 1280, max: 1920 },
                  height: { ideal: 720, max: 1080 },
                  frameRate: { ideal: 30, max: 60 },
                  facingMode: { ideal: cameraFacing },
                },
          };
        }

        console.log("Starting camera with constraints:", constraints);

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Set timeout to detect if camera fails to start properly
        streamTimeoutRef.current = setTimeout(() => {
          if (!videoRef.current?.videoWidth) {
            console.warn("Camera stream timeout - no video data received");
            cleanupCamera();
            setCameraError(
              "La cámara no responde. Intenta con otra cámara o reinicia la página."
            );
          }
        }, 10000); // 10 second timeout

        setCameraStream(stream);
        setShowCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (streamTimeoutRef.current) {
              clearTimeout(streamTimeoutRef.current);
              streamTimeoutRef.current = null;
            }
            videoRef.current?.play().catch((e) => {
              console.warn("Video autoplay failed:", e);
            });
          };

          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
            setCameraError("Error en el elemento de video");
            cleanupCamera();
          };
        }

        if (!isSwitchingCamera && retryCount === 0) {
          toast.success("Cámara activada correctamente");
        }

        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error("Camera error:", error);
        let errorMessage = "No se pudo acceder a la cámara";

        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            errorMessage =
              "Permisos de cámara denegados. Por favor permite el acceso a la cámara.";
          } else if (error.name === "NotFoundError") {
            errorMessage = "No se encontró ninguna cámara en este dispositivo.";
          } else if (error.name === "NotSupportedError") {
            errorMessage = "La cámara no es compatible con este navegador.";
          } else if (error.name === "NotReadableError") {
            errorMessage =
              "La cámara está siendo usada por otra aplicación o hay un problema de hardware.";
          } else if (error.name === "OverconstrainedError") {
            errorMessage =
              "La cámara seleccionada no soporta la configuración requerida.";
          }
        }

        setCameraError(errorMessage);

        // Try with basic configuration if advanced failed and this is not already a retry
        if (!useBasicConfig && retryCount < 2) {
          console.log("Retrying with basic camera configuration...");
          setRetryCount((prev) => prev + 1);
          setTimeout(() => {
            startCamera(deviceId, true);
          }, 1000);
          return;
        }

        toast.error(errorMessage);
        setShowCamera(false);
      } finally {
        setIsSwitchingCamera(false);
      }
    },
    [cleanupCamera, cameraFacing, isSwitchingCamera, retryCount]
  );

  const stopCamera = useCallback(async () => {
    await cleanupCamera();
    setShowCamera(false);
    setCameraError(null);
    setRetryCount(0);
  }, [cleanupCamera]);

  // Enhanced camera switching
  const switchCamera = useCallback(async () => {
    if (availableCameras.length < 2) return;

    setIsSwitchingCamera(true);

    // Stop current camera first
    await cleanupCamera();

    const currentIndex = availableCameras.findIndex(
      (cam) => cam.deviceId === selectedCamera
    );
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    setSelectedCamera(nextCamera.deviceId);
    setCameraFacing(nextCamera.facingMode === "user" ? "user" : "environment");

    try {
      await startCamera(nextCamera.deviceId);
      toast.success(
        `Cambiado a cámara ${
          nextCamera.facingMode === "user" ? "frontal" : "trasera"
        }`
      );
    } catch (error) {
      console.error("Error switching camera:", error);
      toast.error("Error al cambiar de cámara");
      setIsSwitchingCamera(false);
    }
  }, [availableCameras, selectedCamera, startCamera, cleanupCamera]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Error al acceder a la cámara");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Error al procesar la imagen");
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error("La cámara aún no está lista. Intenta de nuevo.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.8);
      });

      if (!blob) {
        toast.error("Error al capturar la imagen");
        return;
      }

      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      await createPreview(file);
      await stopCamera();
      toast.success("Foto capturada exitosamente");
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Error al procesar la foto");
    }
  }, [createPreview, stopCamera]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      cleanupCamera();
      if (previewFile?.preview) {
        URL.revokeObjectURL(previewFile.preview);
      }
    };
  }, [cleanupCamera, previewFile]);

  // Show current image if exists
  if (value && !previewFile) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{label}</Label>
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Subida
              </Badge>
            </div>

            <div className="relative group">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={value || "/placeholder.svg"}
                  alt={alt || "Imagen subida"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isUploading || disabled}
            >
              <Upload className="h-4 w-4 mr-2" />
              Cambiar imagen
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats.map((f) => `image/${f}`).join(",")}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show preview if file is selected
  if (previewFile) {
    return (
      <>
        <Card className={`w-full ${className}`}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Vista previa</Label>
                <div className="flex items-center gap-2">
                  {isCheckingDuplicate && (
                    <Badge variant="outline" className="text-xs">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Verificando...
                    </Badge>
                  )}
                  {existingImage?.exists && (
                    <Badge variant="secondary" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Duplicado encontrado
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <FileImage className="h-3 w-3 mr-1" />
                    Listo para subir
                  </Badge>
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={previewFile.preview || "/placeholder.svg"}
                  alt="Vista previa"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nombre:</p>
                  <p className="font-medium truncate">{previewFile.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tamaño:</p>
                  <p className="font-medium">{previewFile.size}</p>
                </div>
              </div>

              {existingImage?.exists && (
                <Alert className="dark:bg-secondary/50 dark:border-border">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Se encontró una imagen con el mismo nombre:
                      </p>
                      <div className="text-sm space-y-1">
                        <p>
                          • <strong>Archivo:</strong> {existingImage.filename}
                        </p>
                        <p>
                          • <strong>Subido:</strong>{" "}
                          {existingImage.uploadedAt
                            ? formatUploadDate(existingImage.uploadedAt)
                            : "Fecha desconocida"}
                        </p>
                        <p>
                          • <strong>Tamaño:</strong>{" "}
                          {existingImage.size
                            ? formatFileSize(existingImage.size)
                            : "Tamaño desconocido"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Puedes usar la imagen existente, sobrescribirla o subir
                        una nueva con nombre único.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Subiendo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {existingImage?.exists ? (
                  <>
                    <Button
                      onClick={handleUseExisting}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={isUploading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Usar Existente
                    </Button>
                    <Button
                      onClick={handleOverwrite}
                      variant="destructive"
                      disabled={isUploading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sobrescribir
                    </Button>
                    <Button onClick={handleUploadNew} disabled={isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Nueva
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSaveFile}
                    disabled={isUploading || isCheckingDuplicate}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : isCheckingDuplicate ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <DuplicateImageDialog
          open={showDuplicateDialog}
          onOpenChange={setShowDuplicateDialog}
          existingImage={existingImage}
          newFile={previewFile}
          onUseExisting={handleUseExisting}
          onOverwrite={handleOverwrite}
          onUploadNew={handleUploadNew}
          isProcessing={isUploading}
        />
      </>
    );
  }

  // Show upload interface
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Label className="text-sm font-medium">{label}</Label>

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file" className="text-xs">
                <Upload className="h-3 w-3 mr-1" />
                Archivo
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs">
                <LinkIcon className="h-3 w-3 mr-1" />
                URL
              </TabsTrigger>
              <TabsTrigger
                value="camera"
                className="text-xs"
                onClick={getAvailableCameras}
              >
                <Camera className="h-3 w-3 mr-1" />
                Cámara
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {acceptedFormats.join(", ").toUpperCase()} hasta 10MB
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Se detectarán automáticamente archivos duplicados
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || disabled}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats.map((f) => `image/${f}`).join(",")}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl" className="text-sm">
                    URL de la imagen
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isUploading || disabled}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Subiendo desde URL...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleSaveUrl}
                  disabled={!imageUrl.trim() || isUploading || disabled}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Subir desde URL
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="camera" className="space-y-4">
              {cameraError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Error de Cámara:</p>
                      <p>{cameraError}</p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCameraError(null);
                            setRetryCount(0);
                            getAvailableCameras();
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reintentar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCameraError(null);
                            setRetryCount(0);
                            startCamera(selectedCamera, true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Modo Básico
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!showCamera ? (
                <div className="space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-muted rounded-lg">
                      <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">
                        {isMobile
                          ? "Usa la cámara de tu dispositivo"
                          : "Activa tu cámara web"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {availableCameras.length > 0
                          ? `${availableCameras.length} cámara(s) detectada(s)`
                          : "Captura fotos directamente desde tu cámara"}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Las fotos capturadas también se verificarán por
                        duplicados
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startCamera(selectedCamera)}
                        disabled={isUploading || isLoadingCameras || disabled}
                        className="flex-1"
                      >
                        {isLoadingCameras ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Detectando...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Abrir Cámara
                          </>
                        )}
                      </Button>

                      {availableCameras.length === 0 && (
                        <Button
                          variant="outline"
                          onClick={getAvailableCameras}
                          disabled={isLoadingCameras}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Detectar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-lg bg-black"
                    />
                    {(isSwitchingCamera || !videoRef.current?.videoWidth) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">
                            {isSwitchingCamera
                              ? "Cambiando cámara..."
                              : "Cargando cámara..."}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="outline"
                        className="bg-black/50 text-white border-white/20"
                      >
                        <Smartphone className="h-3 w-3 mr-1" />
                        {availableCameras.find(
                          (cam) => cam.deviceId === selectedCamera
                        )?.facingMode === "user"
                          ? "Frontal"
                          : "Trasera"}
                      </Badge>
                    </div>

                    {availableCameras.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={switchCamera}
                          disabled={
                            isUploading || disabled || isSwitchingCamera
                          }
                          className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                        >
                          <FlipHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      disabled={isUploading || disabled || isSwitchingCamera}
                      className="flex-1"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Capturar Foto
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={stopCamera}
                      disabled={isUploading || disabled}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </TabsContent>
          </Tabs>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Funciones Mejoradas:</p>
                <ul className="space-y-0.5">
                  <li>
                    • <strong>Cambio de Cámara:</strong> Toca el ícono de
                    voltear para cambiar entre frontal/trasera
                  </li>
                  <li>
                    • <strong>Detección de Duplicados:</strong> Se verifican
                    automáticamente archivos existentes
                  </li>
                  <li>
                    • <strong>Formulario Seguro:</strong> No se cierra
                    accidentalmente al subir imágenes
                  </li>
                  <li>
                    • <strong>Recuperación de Errores:</strong> Reintentos
                    automáticos y modo básico disponible
                  </li>
                  <li>
                    • <strong>Límites:</strong> Máximo 10MB, formatos:{" "}
                    {acceptedFormats.join(", ").toUpperCase()}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
