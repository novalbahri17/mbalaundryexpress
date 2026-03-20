import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Switch,
  DatePicker,
  Upload,
  message,
  Select,
  Popconfirm,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  UploadOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CrudManager } from "@/components/admin/CrudManager";
import {
  getPageContentValueMap,
  saveBulkPageContents,
} from "@/api/pageContents.api";
import {
  deleteSiteSetting,
  getSiteSettings,
  saveBulkSettings,
  upsertSiteSetting,
} from "@/api/settings.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/useSiteSettings";
import type { SiteSetting } from "@/types/database.types";
import { normalizeHexColor, validateHexColor } from "@/utils/validation";
import {
  AnnouncementCard,
  type AnnouncementType,
} from "@/components/public/home/AnnouncementModal";

const DEFAULT_LIGHT_BG = "#FAFAFA";
const DEFAULT_DARK_BG = "#0A0A0F";

type LandingAppearanceForm = {
  landing_bg_color_light: string;
  landing_bg_color_dark: string;
};

type AnnouncementFormValues = {
  announcement_active: boolean;
  announcement_title?: string;
  announcement_text: string;
  announcement_image_file?: {
    fileList: Array<{
      originFileObj?: File;
      thumbUrl?: string;
    }>;
  };
  announcement_image_url?: string;
  announcement_dates?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  announcement_type: AnnouncementType;
  announcement_recurring: string;
  announcement_frequency: string;
  announcement_cta_label?: string;
  announcement_cta_url?: string;
};

type ModulesFormValues = {
  module_cabang: boolean;
  module_promo: boolean;
  module_galeri: boolean;
  module_harga: boolean;
  module_carapakai: boolean;
  module_blog: boolean;
  module_loker: boolean;
  module_kemitraan: boolean;
  module_kontak: boolean;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const columns: ColumnsType<SiteSetting> = [
  { title: "Key", dataIndex: "key" },
  {
    title: "Value",
    dataIndex: "value",
    render: (value: string, record: SiteSetting) => {
      if (
        record.key === "landing_bg_color_light" ||
        record.key === "landing_bg_color_dark"
      ) {
        const normalized = normalizeHexColor(
          value,
          record.key === "landing_bg_color_dark"
            ? DEFAULT_DARK_BG
            : DEFAULT_LIGHT_BG,
        );
        return (
          <div className="flex items-center gap-2">
            <span
              className="h-4 w-4 rounded border border-neutral-300"
              style={{ backgroundColor: normalized }}
            />
            <span>{normalized}</span>
          </div>
        );
      }
      // Truncate long values (e.g. base64 images)
      if (value && value.length > 80) {
        return (
          <span className="text-xs text-neutral-400">
            {value.substring(0, 60)}…
          </span>
        );
      }
      return value;
    },
  },
  { title: "Deskripsi", dataIndex: "description" },
];

const hexRule = {
  validator: async (_: unknown, value: string) => {
    const raw = value?.trim() ?? "";
    if (!raw) {
      throw new Error("Warna wajib diisi");
    }
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    if (!validateHexColor(withHash)) {
      throw new Error("Format HEX tidak valid. Contoh: #FFFBF1");
    }
  },
};

const TYPE_TITLES: Record<AnnouncementType, string> = {
  info: "Informasi",
  promo: "Promo Spesial! 🎉",
  libur: "Pengumuman Libur",
  maintenance: "Perbaikan Sistem",
};

export default function PengaturanAdminPage() {
  const [appearanceForm] = Form.useForm<LandingAppearanceForm>();
  const [announcementForm] = Form.useForm<AnnouncementFormValues>();
  const [modulesForm] = Form.useForm<ModulesFormValues>();
  const queryClient = useQueryClient();
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: getSiteSettings,
  });
  const { data: pageContentMap = {} } = useQuery({
    queryKey: ["admin-page-content-map"],
    queryFn: getPageContentValueMap,
  });

  const settingsMap = useMemo(
    () =>
      rows.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {}),
    [rows],
  );

  useEffect(() => {
    appearanceForm.setFieldsValue({
      landing_bg_color_light: normalizeHexColor(
        settingsMap.landing_bg_color_light ??
          pageContentMap.landing_bg_color_light,
        DEFAULT_LIGHT_BG,
      ),
      landing_bg_color_dark: normalizeHexColor(
        settingsMap.landing_bg_color_dark ??
          pageContentMap.landing_bg_color_dark,
        DEFAULT_DARK_BG,
      ),
    });

    const hasImage = Boolean(pageContentMap.announcement_image?.trim());
    const isUrl =
      hasImage &&
      (pageContentMap.announcement_image?.startsWith("http://") ||
        pageContentMap.announcement_image?.startsWith("https://") ||
        pageContentMap.announcement_image?.startsWith("/"));

    if (hasImage && isUrl) {
      setImageMode("url");
    }

    announcementForm.setFieldsValue({
      announcement_active:
        pageContentMap.announcement_active === "true" ||
        pageContentMap.announcement_active === "1",
      announcement_title: pageContentMap.announcement_title?.trim() || "",
      announcement_text: pageContentMap.announcement_text ?? "",
      announcement_type:
        (pageContentMap.announcement_type as AnnouncementType) || "info",
      announcement_recurring: pageContentMap.announcement_recurring || "none",
      announcement_frequency:
        pageContentMap.announcement_frequency || "session",
      announcement_image_url: isUrl ? pageContentMap.announcement_image : "",
      announcement_cta_label:
        pageContentMap.announcement_cta_label?.trim() || "",
      announcement_cta_url: pageContentMap.announcement_cta_url?.trim() || "",
      announcement_dates:
        pageContentMap.announcement_start && pageContentMap.announcement_end
          ? [
              dayjs(pageContentMap.announcement_start),
              dayjs(pageContentMap.announcement_end),
            ]
          : undefined,
    });

    modulesForm.setFieldsValue({
      module_cabang: pageContentMap.module_cabang !== "false",
      module_promo: pageContentMap.module_promo !== "false",
      module_galeri: pageContentMap.module_galeri !== "false",
      module_harga: pageContentMap.module_harga !== "false",
      module_carapakai: pageContentMap.module_carapakai !== "false",
      module_blog: pageContentMap.module_blog !== "false",
      module_loker: pageContentMap.module_loker !== "false",
      module_kemitraan: pageContentMap.module_kemitraan !== "false",
      module_kontak: pageContentMap.module_kontak !== "false",
    });
  }, [
    appearanceForm,
    announcementForm,
    modulesForm,
    pageContentMap.landing_bg_color_dark,
    pageContentMap.landing_bg_color_light,
    pageContentMap.announcement_active,
    pageContentMap.announcement_title,
    pageContentMap.announcement_text,
    pageContentMap.announcement_start,
    pageContentMap.announcement_end,
    pageContentMap.announcement_type,
    pageContentMap.announcement_recurring,
    pageContentMap.announcement_frequency,
    pageContentMap.announcement_image,
    pageContentMap.announcement_cta_label,
    pageContentMap.announcement_cta_url,
    pageContentMap.module_cabang,
    pageContentMap.module_promo,
    pageContentMap.module_galeri,
    pageContentMap.module_harga,
    pageContentMap.module_carapakai,
    pageContentMap.module_blog,
    pageContentMap.module_loker,
    pageContentMap.module_kemitraan,
    pageContentMap.module_kontak,
    settingsMap.landing_bg_color_dark,
    settingsMap.landing_bg_color_light,
  ]);

  const lightPreview = normalizeHexColor(
    Form.useWatch("landing_bg_color_light", appearanceForm),
    DEFAULT_LIGHT_BG,
  );
  const darkPreview = normalizeHexColor(
    Form.useWatch("landing_bg_color_dark", appearanceForm),
    DEFAULT_DARK_BG,
  );

  // Watch values for Smart Preview
  const liveTitle = Form.useWatch("announcement_title", announcementForm);
  const liveText = Form.useWatch("announcement_text", announcementForm);
  const liveType: AnnouncementType =
    Form.useWatch("announcement_type", announcementForm) || "info";
  const liveCtaLabel = Form.useWatch(
    "announcement_cta_label",
    announcementForm,
  );
  const liveCtaUrl = Form.useWatch("announcement_cta_url", announcementForm);
  const liveImageFile = Form.useWatch(
    "announcement_image_file",
    announcementForm,
  ) as AnnouncementFormValues["announcement_image_file"] | undefined;
  const liveImageUrl = Form.useWatch(
    "announcement_image_url",
    announcementForm,
  );

  // Resolve preview image: file upload thumb > URL field > existing saved image
  const previewImage =
    liveImageFile?.fileList?.[0]?.thumbUrl ||
    (imageMode === "url" ? liveImageUrl : undefined) ||
    (imageMode === "upload" ? undefined : pageContentMap.announcement_image) ||
    undefined;

  const applyTemplate = (type: AnnouncementType) => {
    const templates: Record<AnnouncementType, { title: string; text: string }> =
      {
        promo: {
          title: "Promo Spesial Hari Ini! 🎉",
          text: "Diskon Cuci 5Kg Gratis 1Kg. Yuk buruan mampir sebelum kehabisan mesin!",
        },
        libur: {
          title: "Pengumuman Libur",
          text: "Mohon maaf, kami tutup sementara dalam rangka libur nasional. Kami akan buka kembali segera.",
        },
        maintenance: {
          title: "Perbaikan Sistem",
          text: "Mohon maaf, sistem operasional kami sedang dalam perbaikan rutin. Silakan cek berkala.",
        },
        info: {
          title: "Informasi",
          text: "Halo pelanggan setia MBA Laundry! Jangan lupa ambil cucian Anda tepat waktu ya.",
        },
      };

    const tpl = templates[type];
    announcementForm.setFieldsValue({
      announcement_title: tpl.title,
      announcement_text: tpl.text,
      announcement_type: type,
      announcement_active: true,
    });
  };

  const insertTag = (tagStart: string, tagEnd: string) => {
    const textarea = document.getElementById(
      "announcement_text",
    ) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = announcementForm.getFieldValue("announcement_text") || "";

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${tagStart}${selected}${tagEnd}${after}`;
    announcementForm.setFieldValue("announcement_text", newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagStart.length,
        start + tagStart.length + selected.length,
      );
    }, 0);
  };

  const handleRemoveImage = async () => {
    announcementForm.setFieldsValue({
      announcement_image_file: undefined,
      announcement_image_url: "",
    });
    await saveBulkPageContents([
      {
        key: "announcement_image",
        value: "",
        type: "text",
        label: "Banner Pengumuman",
        description: "URL/Base64 banner",
        group: "announcement",
      },
    ]);
    await queryClient.invalidateQueries({
      queryKey: ["admin-page-content-map"],
    });
    await queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] });
    message.success("Gambar banner berhasil dihapus");
  };

  const saveAnnouncement = async () => {
    const values = await announcementForm.validateFields();

    // Resolve final image URL
    let imageUrl = pageContentMap.announcement_image ?? "";

    if (imageMode === "url") {
      // Use URL field directly
      imageUrl = values.announcement_image_url?.trim() ?? "";
    } else {
      // Use uploaded file — access via originFileObj (Ant Design Upload with beforeUpload=false)
      const uploadedFile =
        values.announcement_image_file?.fileList?.[0]?.originFileObj;
      if (uploadedFile) {
        imageUrl = await fileToBase64(uploadedFile);
      }
    }

    await saveBulkPageContents([
      {
        key: "announcement_active",
        value: values.announcement_active ? "true" : "false",
        type: "boolean",
        label: "Status Pengumuman",
        description: "Status pengumuman (aktif/tidak)",
        group: "announcement",
      },
      {
        key: "announcement_title",
        value: values.announcement_title?.trim() ?? "",
        type: "text",
        label: "Judul Pengumuman",
        description:
          "Judul popup pengumuman (opsional, default mengikuti tipe)",
        group: "announcement",
      },
      {
        key: "announcement_text",
        value: values.announcement_text ?? "",
        type: "text",
        label: "Teks Pengumuman",
        description: "Isi teks pengumuman",
        group: "announcement",
      },
      {
        key: "announcement_start",
        value: values.announcement_dates?.[0]?.toISOString() ?? "",
        type: "text",
        label: "Mulai Tayang",
        description: "Waktu mulai",
        group: "announcement",
      },
      {
        key: "announcement_end",
        value: values.announcement_dates?.[1]?.toISOString() ?? "",
        type: "text",
        label: "Selesai Tayang",
        description: "Waktu selesai",
        group: "announcement",
      },
      {
        key: "announcement_image",
        value: imageUrl,
        type: "text",
        label: "Banner Pengumuman",
        description: "URL atau Base64 banner header modal",
        group: "announcement",
      },
      {
        key: "announcement_type",
        value: values.announcement_type ?? "info",
        type: "text",
        label: "Tipe Pengumuman",
        description: "Warna dan tema modal",
        group: "announcement",
      },
      {
        key: "announcement_recurring",
        value: values.announcement_recurring ?? "none",
        type: "text",
        label: "Jadwal Berulang",
        description: "Penayangan rutin mingguan",
        group: "announcement",
      },
      {
        key: "announcement_frequency",
        value: values.announcement_frequency ?? "session",
        type: "text",
        label: "Frekuensi Tampil",
        description: "Seberapa sering modal muncul",
        group: "announcement",
      },
      {
        key: "announcement_cta_label",
        value: values.announcement_cta_label?.trim() ?? "",
        type: "text",
        label: "Label Tombol Aksi",
        description: "Teks tombol CTA opsional (kosongkan jika tidak perlu)",
        group: "announcement",
      },
      {
        key: "announcement_cta_url",
        value: values.announcement_cta_url?.trim() ?? "",
        type: "text",
        label: "URL Tombol Aksi",
        description: "Link tujuan tombol CTA",
        group: "announcement",
      },
    ]);

    message.success("Pengumuman berhasil disimpan!");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
      queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
      queryClient.invalidateQueries({
        queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
      }),
    ]);
  };

  const saveLandingAppearance = async (): Promise<void> => {
    const values = await appearanceForm.validateFields();
    const lightColor = normalizeHexColor(
      values.landing_bg_color_light,
      DEFAULT_LIGHT_BG,
    );
    const darkColor = normalizeHexColor(
      values.landing_bg_color_dark,
      DEFAULT_DARK_BG,
    );

    await Promise.all([
      saveBulkSettings([
        {
          key: "landing_bg_color_light",
          value: lightColor,
          description: "Warna background landing page saat light mode (HEX)",
        },
        {
          key: "landing_bg_color_dark",
          value: darkColor,
          description: "Warna background landing page saat dark mode (HEX)",
        },
      ]),
      saveBulkPageContents([
        {
          key: "landing_bg_color_light",
          value: lightColor,
          type: "text",
          label: "Landing Background Light",
          description: "Warna background landing page light mode",
          group: "landing-style",
        },
        {
          key: "landing_bg_color_dark",
          value: darkColor,
          type: "text",
          label: "Landing Background Dark",
          description: "Warna background landing page dark mode",
          group: "landing-style",
        },
      ]),
    ]);

    message.success("Warna background landing berhasil disimpan");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
      queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
      queryClient.invalidateQueries({
        queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
      }),
      queryClient.invalidateQueries({ queryKey: [SITE_SETTINGS_QUERY_KEY] }),
      queryClient.invalidateQueries({
        queryKey: [SITE_SETTINGS_QUERY_KEY, "map"],
      }),
    ]);
  };

  const saveModules = async () => {
    const values = await modulesForm.validateFields();
    const keys = [
      "module_cabang",
      "module_promo",
      "module_galeri",
      "module_harga",
      "module_carapakai",
      "module_blog",
      "module_loker",
      "module_kemitraan",
      "module_kontak",
    ];

    const payload = keys.map((key) => ({
      key,
      value: (values as Record<string, boolean>)[key] ? "true" : "false",
      type: "boolean" as const,
      label: `Modul ${key.replace("module_", "")}`,
      description: `Visibilitas modul ${key.replace("module_", "")}`,
      group: "modules",
    }));

    await saveBulkPageContents(payload);
    message.success("Visibilitas modul berhasil diperbarui");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
      queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
      queryClient.invalidateQueries({
        queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
      }),
    ]);
  };

  const hasExistingImage = Boolean(pageContentMap.announcement_image?.trim());

  return (
    <div className="space-y-4">
      <div className="admin-page-shell">
        <div className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Pengaturan Global</h1>
            <p className="admin-page-subtitle">
              Atur tampilan landing dan konfigurasi sistem dari dashboard admin.
            </p>
          </div>
        </div>
        <div className="admin-page-body space-y-4">
          {/* ── Modul Visibilitas ── */}
          <Card
            title="Manajemen Modul & Halaman Publik"
            className="shadow-sm border-ruby-200"
          >
            <Alert
              showIcon
              type="info"
              message="Pengaturan Visibilitas Global"
              description="Matikan switch di bawah jika Anda tidak ingin menampilkan halaman atau menu tersebut di Landing Page Publik."
              className="mb-6"
            />
            <Form form={modulesForm} layout="horizontal">
              <Row gutter={[24, 16]}>
                {[
                  { name: "module_cabang", on: "Cabang On", off: "Cabang Off" },
                  { name: "module_promo", on: "Promo On", off: "Promo Off" },
                  { name: "module_harga", on: "Harga On", off: "Harga Off" },
                  {
                    name: "module_carapakai",
                    on: "Cara Pakai On",
                    off: "Cara Pakai Off",
                  },
                  { name: "module_galeri", on: "Galeri On", off: "Galeri Off" },
                  { name: "module_blog", on: "Blog On", off: "Blog Off" },
                  { name: "module_loker", on: "Loker On", off: "Loker Off" },
                  {
                    name: "module_kemitraan",
                    on: "Kemitraan On",
                    off: "Kemitraan Off",
                  },
                  { name: "module_kontak", on: "Kontak On", off: "Kontak Off" },
                ].map((mod) => (
                  <Col key={mod.name} xs={24} sm={12} md={8} xl={6}>
                    <Form.Item
                      name={mod.name}
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch
                        checkedChildren={mod.on}
                        unCheckedChildren={mod.off}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <Button type="primary" onClick={() => void saveModules()}>
                  Simpan Pengaturan Visibilitas
                </Button>
              </div>
            </Form>
          </Card>

          {/* ── Pengumuman Popup Modal ── */}
          <Card title="Pengumuman (Popup Modal)" className="shadow-sm">
            <Row gutter={24}>
              {/* Left: Form */}
              <Col xs={24} lg={14}>
                {/* Magic Templates */}
                <div className="mb-5 rounded-lg border border-ruby-200 bg-ruby-50 p-4 dark:border-ruby-900/50 dark:bg-ruby-900/20">
                  <div className="mb-2 text-sm font-semibold text-ruby-700 dark:text-ruby-400">
                    ✨ Magic Templates (Jalur Cepat)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "promo",
                        "libur",
                        "maintenance",
                        "info",
                      ] as AnnouncementType[]
                    ).map((t) => (
                      <Button
                        key={t}
                        size="small"
                        onClick={() => applyTemplate(t)}
                      >
                        {t === "promo" && "🎁 Mode Promo"}
                        {t === "libur" && "🔒 Mode Libur"}
                        {t === "maintenance" && "🔧 Mode Maintenance"}
                        {t === "info" && "ℹ️ Mode Info"}
                      </Button>
                    ))}
                  </div>
                </div>

                <Form form={announcementForm} layout="vertical">
                  {/* Row 1: Status + Tema */}
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="announcement_active"
                        label="Status Penayangan"
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Aktif"
                          unCheckedChildren="Mati"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="announcement_type" label="Tema Tampilan">
                        <Select
                          options={[
                            { label: "ℹ️ Standar Info (Biru)", value: "info" },
                            {
                              label: "🎉 Promo Spesial (Emas)",
                              value: "promo",
                            },
                            {
                              label: "🔒 Libur / Tutup (Merah)",
                              value: "libur",
                            },
                            {
                              label: "🔧 Maintenance (Oranye)",
                              value: "maintenance",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Judul Kustom */}
                  <Form.Item
                    name="announcement_title"
                    label={
                      <span>
                        Judul Pengumuman{" "}
                        <Tag color="default" className="ml-1 font-normal">
                          Opsional
                        </Tag>
                      </span>
                    }
                    extra={`Kosongkan untuk judul otomatis: "${TYPE_TITLES[liveType]}"`}
                  >
                    <Input
                      placeholder="Contoh: Selamat Hari Raya Idul Fitri 🎊"
                      maxLength={80}
                      showCount
                    />
                  </Form.Item>

                  {/* Isi Pengumuman + Toolbar */}
                  <Form.Item label="Isi Pengumuman" className="mb-2">
                    <div className="mb-2 flex flex-wrap gap-2 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
                      <span className="text-xs font-semibold text-neutral-500 mr-1">
                        Toolbar:
                      </span>
                      <Button
                        size="small"
                        onClick={() => insertTag("<b>", "</b>")}
                        className="font-bold"
                      >
                        B
                      </Button>
                      <Button
                        size="small"
                        onClick={() => insertTag("<i>", "</i>")}
                        className="italic"
                      >
                        I
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          insertTag(
                            '<a href="#" class="underline text-blue-300">',
                            "</a>",
                          )
                        }
                      >
                        🔗 Link
                      </Button>
                      <div className="w-px h-4 bg-neutral-300 mx-1 dark:bg-neutral-600" />
                      <Button
                        size="small"
                        onClick={() =>
                          insertTag('<span class="text-sm">', "</span>")
                        }
                      >
                        T-Kecil
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          insertTag(
                            '<span class="text-xl font-bold">',
                            "</span>",
                          )
                        }
                      >
                        T-Besar
                      </Button>
                      <div className="w-px h-4 bg-neutral-300 mx-1 dark:bg-neutral-600" />
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => insertTag("{Nama Pelanggan}", "")}
                        className="border-dashed"
                      >
                        &#123;Nama Pelanggan&#125;
                      </Button>
                    </div>
                    <Form.Item
                      name="announcement_text"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Isi pengumuman wajib diisi",
                        },
                      ]}
                    >
                      <Input.TextArea
                        id="announcement_text"
                        rows={5}
                        placeholder="Ketik pengumuman di sini..."
                        className="font-mono text-sm"
                      />
                    </Form.Item>
                    <div className="mt-1 text-xs text-neutral-400">
                      Mendukung tag HTML dasar dan variabel otomatis.
                    </div>
                  </Form.Item>

                  {/* Row 3: Jadwal Berulang + Range Tanggal */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="announcement_recurring"
                        label="Tayang Berulang Mingguan"
                      >
                        <Select
                          options={[
                            {
                              label: "Tidak (Muncul Tiap Hari)",
                              value: "none",
                            },
                            {
                              label: "Hanya Hari Jumat (Promo Jumat)",
                              value: "friday",
                            },
                            {
                              label: "Hanya Akhir Pekan (Sabtu & Minggu)",
                              value: "weekend",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="announcement_dates"
                        label="Jadwal Tayang Khusus"
                      >
                        <DatePicker.RangePicker
                          showTime
                          format="YYYY-MM-DD HH:mm"
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Row 4: Frekuensi + Gambar */}
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="announcement_frequency"
                        label="Frekuensi Tampil"
                      >
                        <Select
                          options={[
                            {
                              label: "🔥 Setiap Refresh (Penting/Urgent)",
                              value: "always",
                            },
                            {
                              label: "🕒 Sekali per Sesi Browser (Normal)",
                              value: "session",
                            },
                            {
                              label: "🛑 Sekali Saja (Sampai klik Mengerti)",
                              value: "once",
                            },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      {/* Image: toggle upload vs URL */}
                      <Form.Item
                        label={
                          <span className="flex items-center gap-2">
                            Banner / Gambar Header
                            <Tag color="default" className="font-normal">
                              Opsional
                            </Tag>
                          </span>
                        }
                      >
                        <div className="mb-2 flex gap-2">
                          <Button
                            size="small"
                            type={
                              imageMode === "upload" ? "primary" : "default"
                            }
                            onClick={() => setImageMode("upload")}
                          >
                            📤 Upload File
                          </Button>
                          <Button
                            size="small"
                            type={imageMode === "url" ? "primary" : "default"}
                            icon={<LinkOutlined />}
                            onClick={() => setImageMode("url")}
                          >
                            URL Gambar
                          </Button>
                        </div>

                        {imageMode === "upload" ? (
                          <Form.Item name="announcement_image_file" noStyle>
                            <Upload
                              maxCount={1}
                              beforeUpload={() => false}
                              listType="picture"
                              accept="image/*"
                            >
                              <Button icon={<UploadOutlined />}>
                                Pilih Gambar
                              </Button>
                            </Upload>
                          </Form.Item>
                        ) : (
                          <Form.Item name="announcement_image_url" noStyle>
                            <Input
                              placeholder="https://example.com/gambar.jpg"
                              prefix={
                                <LinkOutlined className="text-neutral-400" />
                              }
                            />
                          </Form.Item>
                        )}

                        {/* Status gambar tersimpan + tombol hapus */}
                        {hasExistingImage && (
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-900/20">
                            <span className="text-xs text-emerald-700 dark:text-emerald-400">
                              ✅ Banner aktif tersimpan
                            </span>
                            <Popconfirm
                              title="Hapus gambar banner?"
                              description="Tampilan header modal akan kembali ke gradien warna."
                              onConfirm={() => void handleRemoveImage()}
                              okText="Hapus"
                              cancelText="Batal"
                            >
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                className="text-xs"
                              >
                                Hapus
                              </Button>
                            </Popconfirm>
                          </div>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* CTA Button */}
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800 mb-4">
                    <div className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                      🔗 Tombol Aksi (CTA){" "}
                      <Tag color="default" className="ml-1 font-normal">
                        Opsional
                      </Tag>
                    </div>
                    <Row gutter={12}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="announcement_cta_label"
                          label="Label Tombol"
                          className="mb-0"
                        >
                          <Input
                            placeholder="Contoh: Lihat Promo →"
                            maxLength={40}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="announcement_cta_url"
                          label="URL Tujuan"
                          className="mb-0"
                          rules={[
                            {
                              type: "url",
                              message: "Masukkan URL yang valid",
                              warningOnly: true,
                            },
                          ]}
                        >
                          <Input
                            placeholder="https://..."
                            prefix={
                              <LinkOutlined className="text-neutral-400" />
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <p className="mt-2 text-xs text-neutral-400">
                      Kosongkan keduanya jika tidak ingin menampilkan tombol
                      aksi tambahan.
                    </p>
                  </div>

                  <Button
                    type="primary"
                    onClick={() => void saveAnnouncement()}
                    style={{
                      backgroundColor: "#F97316",
                      borderColor: "#ea580c",
                    }}
                    className="w-full sm:w-auto"
                    size="large"
                  >
                    Simpan Pengumuman
                  </Button>
                </Form>
              </Col>

              {/* Right: Live Preview */}
              <Col xs={24} lg={10}>
                <div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800 flex flex-col">
                  <h4 className="mb-1 font-semibold text-neutral-600 dark:text-neutral-400">
                    👀 Smart Live Preview
                  </h4>
                  <p className="mb-4 text-xs text-neutral-400">
                    Preview memantulkan tema, judul, dan tombol aksi secara
                    langsung.
                  </p>
                  <div className="flex flex-1 items-start justify-center pointer-events-none relative">
                    <div className="w-[125%] max-w-sm origin-top scale-[0.78]">
                      <AnnouncementCard
                        title={liveTitle || undefined}
                        text={
                          liveText ||
                          "Ketik sesuatu untuk melihat pratinjau langsung di sini..."
                        }
                        type={liveType}
                        image={previewImage}
                        ctaLabel={liveCtaLabel || undefined}
                        ctaUrl={liveCtaUrl || "#"}
                      />
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag color="blue">Tema: {liveType}</Tag>
                    {liveTitle && <Tag color="green">Judul Custom ✓</Tag>}
                    {liveCtaLabel && (
                      <Tag color="orange">CTA: {liveCtaLabel}</Tag>
                    )}
                    {previewImage && <Tag color="purple">Banner ✓</Tag>}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* ── Tampilan Landing Page ── */}
          <Card title="Tampilan Landing Page" className="shadow-sm">
            <Form form={appearanceForm} layout="vertical" autoComplete="off">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="landing_bg_color_light"
                    label="Background Light Mode"
                    rules={[hexRule]}
                    extra="Format HEX, contoh: #FFFBF1"
                  >
                    <Input placeholder="#FAFAFA" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="landing_bg_color_dark"
                    label="Background Dark Mode"
                    rules={[hexRule]}
                    extra="Format HEX, contoh: #0A0A0F"
                  >
                    <Input placeholder="#0A0A0F" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16} className="mb-4">
                <Col xs={24} md={12}>
                  <div className="rounded-xl border border-neutral-200 p-3">
                    <p className="mb-2 text-xs font-semibold text-neutral-600">
                      Preview Light
                    </p>
                    <div
                      className="h-16 rounded-lg border border-neutral-200"
                      style={{ backgroundColor: lightPreview }}
                    />
                    <p className="mt-2 text-xs font-mono text-neutral-600">
                      {lightPreview}
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="rounded-xl border border-neutral-200 p-3">
                    <p className="mb-2 text-xs font-semibold text-neutral-600">
                      Preview Dark
                    </p>
                    <div
                      className="h-16 rounded-lg border border-neutral-700"
                      style={{ backgroundColor: darkPreview }}
                    />
                    <p className="mt-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                      {darkPreview}
                    </p>
                  </div>
                </Col>
              </Row>

              <Button
                type="primary"
                onClick={() => void saveLandingAppearance()}
              >
                Simpan Warna Landing
              </Button>
            </Form>
          </Card>
        </div>
      </div>

      {/* ── Site Settings Raw Table ── */}
      <CrudManager<SiteSetting>
        title="Pengaturan Lainnya"
        queryKey="admin-site-settings"
        fetcher={getSiteSettings}
        createItem={upsertSiteSetting}
        updateItem={(_, payload) => upsertSiteSetting(payload)}
        deleteItem={deleteSiteSetting}
        columns={columns}
        fields={[
          { name: "key", label: "Key", type: "text", required: true },
          { name: "value", label: "Value", type: "text", required: true },
          { name: "description", label: "Deskripsi", type: "textarea" },
        ]}
      />
    </div>
  );
}
