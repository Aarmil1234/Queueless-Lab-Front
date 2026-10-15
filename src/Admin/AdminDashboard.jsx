
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FileText,
  FlaskConical,
  Plus,
  RefreshCw,
} from "lucide-react";
import AdminLogin, { API, payloadOf } from "../Login/AdminLogin";

const filters = ["today", "week", "month", "year", "all"];

const emptyLab = {
  labName: "",
  ownerName: "",
  mobileNumber: "",
  labMobileNumber: "",
  email: "",
  password: "",
  isActive: true,
};

const pickArray = (value) =>
  Array.isArray(value) ? value : value?.labs || value?.data || [];

export default function AdminDashboard() {
  const location = useLocation();

  if (!localStorage.getItem("superAdminToken")) {
    return location.pathname.endsWith("/login") ? (
      <AdminLogin />
    ) : (
      <Navigate to="/super-admin/login" replace />
    );
  }

  return <SuperAdminWorkspace />;
}

function SuperAdminWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();

  const sectionFromPath = location.pathname.includes("/pending-tests")
    ? "pending-tests"
    : location.pathname.includes("/bookings")
      ? "bookings"
      : location.pathname.includes("/reports")
        ? "reports"
        : location.pathname.includes("/tests")
          ? "tests"
          : location.pathname.includes("/labs")
            ? "labs"
            : location.pathname.includes("/settings")
              ? "settings"
              : "dashboard";

  const [section, setSection] = useState(sectionFromPath);
  const [filter, setFilter] = useState("today");
  const [counts, setCounts] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [metricLabs, setMetricLabs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLab, setSelectedLab] = useState(null);
  const [labCounts, setLabCounts] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [labForm, setLabForm] = useState(emptyLab);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const goSection = (id) => {
    setSelectedLab(null);
    setSection(id);
    navigate(`/super-admin/${id}`);
  };

  useEffect(() => {
    setSection(sectionFromPath);
    setSelectedLab(null);
  }, [location.pathname, sectionFromPath]);

  useEffect(() => {
    const requestId = API.interceptors.request.use((config) => {
      const token = localStorage.getItem("superAdminToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    const responseId = API.interceptors.response.use(
      (response) => response,
      (err) => {
        if (
          err?.response?.status === 401 &&
          !String(err?.config?.url).includes("/login")
        ) {
          localStorage.removeItem("superAdminToken");
          localStorage.removeItem("superAdminUser");
          window.location.assign("/super-admin/login");
        }

        return Promise.reject(err);
      }
    );

    return () => {
      API.interceptors.request.eject(requestId);
      API.interceptors.response.eject(responseId);
    };
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const result = payloadOf(await API.get("/api/super-admin/me"));
      const user = result?.user || result;

      localStorage.setItem("superAdminUser", JSON.stringify(user));
      window.dispatchEvent(new Event("superAdminProfileUpdated"));
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Could not load administrator profile."
      );
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [countRes, bookingRes] = await Promise.all([
        API.get(`/api/super-admin/dashboard/counts?filter=${filter}`),
        API.get(
          `/api/super-admin/dashboard/lab-wise-bookings?filter=${filter}`
        ),
      ]);

      setCounts(payloadOf(countRes));
      setBookings(pickArray(payloadOf(bookingRes)));
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadLabs = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const result = payloadOf(
        await API.get("/api/super-admin/labs?page=1&limit=100")
      );
      const totalPages = Number(result?.pagination?.totalPages || 1);
      const laterPages = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
          API.get(`/api/super-admin/labs?page=${index + 2}&limit=100`)
        )
      );
      const allLabs = [
        ...pickArray(result),
        ...laterPages.flatMap((response) =>
          pickArray(payloadOf(response))
        ),
      ];

      setLabs(allLabs);
      setPagination({
        page,
        totalPages: Math.max(1, Math.ceil(allLabs.length / 10)),
        total: allLabs.length,
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load labs.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetricLabs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = payloadOf(
        await API.get("/api/super-admin/labs?page=1&limit=100")
      );

      const totalPages = Number(result?.pagination?.totalPages || 1);

      const laterPages = await Promise.all(
        Array.from(
          { length: Math.max(0, totalPages - 1) },
          (_, index) =>
            API.get(
              `/api/super-admin/labs?page=${index + 2}&limit=100`
            )
        )
      );

      const labList = [
        ...pickArray(result),
        ...laterPages.flatMap((response) =>
          pickArray(payloadOf(response))
        ),
      ];

      const rows = await Promise.all(
        labList.map(async (lab) => {
          try {
            const detail = payloadOf(
              await API.get(
                `/api/super-admin/labs/${lab._id}?filter=${filter}`
              )
            );

            return {
              ...lab,
              ...(detail?.lab || {}),
              ...(detail?.counts || {}),
            };
          } catch {
            return lab;
          }
        })
      );

      setMetricLabs(rows);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not load lab metrics."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (["dashboard", "bookings"].includes(section)) {
      loadDashboard();
    }
  }, [section, loadDashboard]);

  useEffect(() => {
    if (section === "labs") {
      loadLabs(1);
    }
  }, [section, loadLabs]);

  useEffect(() => {
    if (["reports", "tests", "pending-tests"].includes(section)) {
      loadMetricLabs();
    }
  }, [section, loadMetricLabs]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const openLab = async (lab, activityFilter = filter) => {
    setSelectedLab(lab);
    setLabCounts(null);

    try {
      const result = payloadOf(
        await API.get(
          `/api/super-admin/labs/${lab._id}?filter=${activityFilter}`
        )
      );

      setSelectedLab(result?.lab || lab);
      setLabCounts(result?.counts || null);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not load lab details."
      );
    }
  };

  const createLab = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await API.post("/api/super-admin/labs", labForm);

      setCreateOpen(false);
      setLabForm(emptyLab);
      notify("Lab created successfully.");

      await loadLabs(pagination.page || 1);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not create lab.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLab = async (lab) => {
    try {
      await API.patch(`/api/super-admin/labs/${lab._id}/status`, {
        isActive: !lab.isActive,
      });

      notify(
        `${lab.labName} is now ${
          lab.isActive ? "inactive" : "active"
        }.`
      );

      await loadLabs(pagination.page || 1);

      if (selectedLab?._id === lab._id) {
        setSelectedLab({
          ...selectedLab,
          isActive: !lab.isActive,
        });
      }
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not update lab status."
      );
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await API.post(
        "/api/super-admin/change-password",
        passwordForm
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });

      notify("Password updated successfully.");
    } catch (e) {
      setError(
        e?.response?.data?.message || "Could not update password."
      );
    } finally {
      setSaving(false);
    }
  };

  const visibleLabs = useMemo(
    () =>
      labs.filter((lab) => {
        const matches =
          `${lab.labName} ${lab.ownerName} ${lab.email} ${lab.mobileNumber}`
            .toLowerCase()
            .includes(search.toLowerCase());

        return (
          matches &&
          (statusFilter === "all" ||
            (statusFilter === "active"
              ? lab.isActive
              : !lab.isActive))
        );
      }),
    [labs, search, statusFilter]
  );
  const filteredLabPages = Math.max(1, Math.ceil(visibleLabs.length / 10));
  const currentLabPage = Math.min(pagination.page || 1, filteredLabPages);
  const pagedLabs = visibleLabs.slice(
    (currentLabPage - 1) * 10,
    currentLabPage * 10
  );

  const heading = selectedLab
    ? selectedLab.labName
    : section === "dashboard"
      ? "Platform overview"
      : section === "labs"
        ? "Lab management"
        : section === "bookings"
          ? "Bookings by lab"
          : section === "reports"
            ? "Reports by lab"
            : section === "tests"
              ? "Tests by lab"
              : section === "pending-tests"
                ? "Pending tests by lab"
                : "Change Password";

  const metrics = [
    {
      key: "totalLabs",
      label: "Total labs",
      icon: Building2,
      note: `${counts?.newLabs ?? 0} new in period`,
    },
    {
      key: "activeLabs",
      label: "Active labs",
      icon: Building2,
      note: `${counts?.inactiveLabs ?? 0} inactive`,
    },
    {
      key: "totalBookings",
      label: "Bookings",
      icon: CalendarDays,
      note: "Across all labs",
    },
    {
      key: "totalReports",
      label: "Reports",
      icon: FileText,
      note: "Across all labs",
    },
    {
      key: "totalTests",
      label: "Tests",
      icon: FlaskConical,
      note: "Across all labs",
    },
    {
      key: "pendingTests",
      label: "Pending tests",
      icon: ClipboardList,
      note: `${counts?.submittedTests ?? 0} submitted`,
    },
  ];

  return (
    <div className="reports-wrapper">
      <div className="reports-container">
        
<div className="reports-header">
  <div>
    <h2>{heading}</h2>
    <p className="mb-0 mt-1 text-muted">
      {selectedLab
        ? "Lab account details and activity"
        : section === "dashboard"
          ? "A clear view of lab operations and platform activity."
          : section === "labs"
            ? "Create, review, and manage registered diagnostic labs."
            : section === "bookings"
              ? "Lab booking totals for the selected period."
              : ["reports", "tests", "pending-tests"].includes(section)
                ? "Per-lab totals for the selected period."
                : "Manage your administrator credentials."}
    </p>
  </div>

  {section === "labs" && !selectedLab && (
      <div className="d-flex flex-wrap gap-2 mt-2">
        <input
          className="form-control"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((current) => ({ ...current, page: 1 }));
          }}
          placeholder="Search labs, owners, or email"
          style={{ width: 280 }}
        />

        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((current) => ({ ...current, page: 1 }));
          }}
          style={{ width: 160 }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    )}

  <div className="d-flex align-items-center flex-wrap gap-2">
    {section === "dashboard" && (
      <select
        className="form-control"
        style={{ width: 160 }}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {filters.map((item) => (
          <option key={item} value={item}>
            {item[0].toUpperCase() + item.slice(1)}
          </option>
        ))}
      </select>
    )}

    {["bookings", "reports", "tests", "pending-tests"].includes(section) && (
      <>
        <select
          className="form-control"
          aria-label="Activity period"
          style={{ width: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {filters.map((item) => (
            <option key={item} value={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        <button
          className="btn-report btn-secondary"
          aria-label="Refresh list"
          onClick={section === "bookings" ? loadDashboard : loadMetricLabs}
        >
          <RefreshCw size={16} />
        </button>
      </>
    )}

    {section === "labs" && !selectedLab && (
      <button
        className="btn-report btn-primary"
        onClick={() => {
          setError("");
          setCreateOpen(true);
        }}
      >
        <Plus size={17} /> Add lab
      </button>
    )}

    {selectedLab && (
      <>
        <span className={`super-admin-status-pill ${selectedLab.isActive ? "is-active" : "is-inactive"}`}>
          <span className="super-admin-status-dot" />
          {selectedLab.isActive ? "Active" : "Inactive"}
        </span>
        <select
          className="form-control"
          aria-label="Lab activity period"
          style={{ width: 150 }}
          value={filter}
          onChange={(event) => {
            const nextFilter = event.target.value;
            setFilter(nextFilter);
            openLab(selectedLab, nextFilter);
          }}
        >
          {filters.map((item) => (
            <option key={item} value={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        <button
          className="btn-report btn-secondary"
          aria-label="Refresh lab details"
          onClick={() => openLab(selectedLab)}
        >
          <RefreshCw size={15} /> Refresh
        </button>
        <button
          className="btn-report btn-primary"
          onClick={() => toggleLab(selectedLab)}
        >
          {selectedLab.isActive ? "Deactivate lab" : "Activate lab"}
        </button>
        <button
          className="btn-report btn-secondary"
          onClick={() => setSelectedLab(null)}
        >
          <ChevronLeft size={16} /> All labs
        </button>
      </>
    )}
  </div>
</div>


        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <CircleAlert size={17} />
            {error}
            <button
              className="btn-close ms-auto"
              onClick={() => setError("")}
            />
          </div>
        )}

        {loading && (
          <div className="text-center text-muted p-5">
            <RefreshCw size={18} /> Loading workspace data…
          </div>
        )}

        {!loading && section === "dashboard" && (
          <div className="row g-3 mb-4">
            {metrics.map((item) => {
              const Icon = item.icon;

              const destination =
                item.key === "totalLabs" || item.key === "activeLabs"
                  ? "labs"
                  : item.key === "totalBookings"
                    ? "bookings"
                    : item.key === "totalReports"
                      ? "reports"
                      : item.key === "totalTests"
                        ? "tests"
                        : "pending-tests";

              return (
                <div
                  className="col-md-6 col-xl-4"
                  key={item.key}
                >
                  <button
                    type="button"
                    className="report-header-section super-admin-metric-card h-100 mb-0 p-4"
                    onClick={() => {
                      if (destination === "labs") {
                        setStatusFilter(item.key === "activeLabs" ? "active" : "all");
                        setSearch("");
                        setPagination((current) => ({ ...current, page: 1 }));
                      }
                      goSection(destination);
                    }}
                    aria-label={`View ${item.label} list`}
                  >
                    <Icon size={22} className="mb-2" />
                    <span className="d-block text-muted">
                      {item.label}
                    </span>
                    <b className="d-block fs-2 text-dark">
                      {counts?.[item.key] ?? "—"}
                    </b>
                    <small className="text-muted">{item.note}</small>
                    <span className="super-admin-card-hint">
                      View list <ChevronRight size={14} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && section === "bookings" && (
          <>
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Lab</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Total bookings</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.length ? (
                    bookings.map((row) => (
                      <tr key={row.labId}>
                        <td>{row.labName}</td>
                        <td>{row.ownerName}</td>
                        <td>
                          <span
                            className={`badge ${
                              row.isActive
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {row.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{row.totalBookings ?? 0}</td>
                        <td>
                          <button
                            className="btn-report btn-primary"
                            onClick={() => {
                              goSection("labs");
                              setTimeout(
                                () =>
                                  openLab({
                                    _id: row.labId,
                                    labName: row.labName,
                                    ownerName: row.ownerName,
                                    isActive: row.isActive,
                                  }),
                                0
                              );
                            }}
                          >
                            View lab
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No booking activity for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading &&
          ["reports", "tests", "pending-tests"].includes(section) && (
            <>
              <div className="table-responsive">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Lab</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>
                        {section === "reports"
                          ? "Reports"
                          : section === "tests"
                            ? "Total tests"
                            : "Pending tests"}
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {metricLabs.length ? (
                      metricLabs.map((lab) => (
                        <tr key={lab._id}>
                          <td>{lab.labName}</td>
                          <td>{lab.ownerName}</td>
                          <td>
                            <span
                              className={`badge ${
                                lab.isActive
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {lab.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            {section === "reports"
                              ? lab.totalReports ?? 0
                              : section === "tests"
                                ? lab.totalTests ?? 0
                                : lab.pendingTests ?? 0}
                          </td>
                          <td>
                            <button
                              className="btn-report btn-primary"
                              onClick={() => {
                                goSection("labs");
                                setTimeout(() => openLab(lab), 0);
                              }}
                            >
                              View lab
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No labs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        {!loading && section === "labs" && !selectedLab && (
          <>

            <div className="table-responsive">
              <table className="reports-table super-admin-labs-table">
                <thead>
                  <tr>
                    <th>Lab</th>
                    <th>Owner</th>
                    <th>Contact</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleLabs.length ? (
                    pagedLabs.map((lab) => (
                      <tr key={lab._id}>
                        <td>
                          <button
                            className="super-admin-lab-link"
                            onClick={() => openLab(lab)}
                          >
                            <span className="super-admin-lab-name">
                              {lab.labName}
                            </span>
                            <span className="super-admin-lab-email">
                              {lab.email}
                            </span>
                          </button>
                        </td>

                        <td>{lab.ownerName}</td>

                        <td>
                          {lab.mobileNumber}
                          <small className="d-block text-muted">
                            Lab: {lab.labMobileNumber}
                          </small>
                        </td>

                        <td>{lab.totalBookings ?? 0}</td>

                        <td>
                          <span
                            className={`super-admin-status-pill ${
                              lab.isActive
                                ? "is-active"
                                : "is-inactive"
                            }`}
                          >
                            <span className="super-admin-status-dot" />
                            {lab.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <div className="super-admin-lab-actions">
                            <button
                              className="btn-report btn-primary"
                              onClick={() => openLab(lab)}
                            >
                              Details
                            </button>

                            <button
                              className={`super-admin-status-switch ${
                                lab.isActive
                                  ? "is-active"
                                  : "is-inactive"
                              }`}
                              type="button"
                              role="switch"
                              aria-checked={Boolean(lab.isActive)}
                              aria-label={`${
                                lab.isActive ? "Deactivate" : "Activate"
                              } ${lab.labName}`}
                              title={
                                lab.isActive
                                  ? "Deactivate lab"
                                  : "Activate lab"
                              }
                              onClick={() => toggleLab(lab)}
                            >
                              <span />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        {labs.length
                          ? "No labs match your search."
                          : "No labs found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 super-admin-pagination">
              <small>{visibleLabs.length} {statusFilter === "all" && !search ? "registered" : "matching"} lab{visibleLabs.length === 1 ? "" : "s"}</small>

              <div className="d-flex align-items-center gap-2">
                {filteredLabPages > 1 && (
                  <button
                    className="btn-report btn-secondary"
                    disabled={currentLabPage <= 1}
                    aria-label="Previous page"
                    onClick={() => setPagination((current) => ({ ...current, page: currentLabPage - 1 }))}
                  >
                    <ChevronLeft size={17} />
                  </button>
                )}
                <small>Page {currentLabPage} of {filteredLabPages}</small>
                {filteredLabPages > 1 && (
                  <button
                    className="btn-report btn-secondary"
                    disabled={currentLabPage >= filteredLabPages}
                    aria-label="Next page"
                    onClick={() => setPagination((current) => ({ ...current, page: currentLabPage + 1 }))}
                  >
                    <ChevronRight size={17} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {!loading && section === "labs" && selectedLab && (
            <LabDetails lab={selectedLab} counts={labCounts} filter={filter} />
        )}

        {section === "settings" && (
          <>
            <form
              className="reports-form-card"
              onSubmit={changePassword}
            >
              <div className="reports-form-grid">
                <label>Current password</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="current-password"
                />

                <label>New password</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                className="btn-report btn-primary mt-4"
                disabled={saving}
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <Check size={17} /> Update password
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      {toast && (
        <div
          className="alert alert-success position-fixed bottom-0 end-0 m-3 shadow"
          style={{ zIndex: 1080 }}
        >
          <Check size={17} /> {toast}
        </div>
      )}

      {createOpen && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCreateOpen(false);
            }
          }}
          style={{
            backgroundColor: "rgba(0,0,0,.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <section className="modal-content">
              <div className="modal-header">
                <div>
                  <h2 className="modal-title h5">Add a lab</h2>
                  <p className="text-muted small mb-0">
                    Enter the details for the new lab account.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setCreateOpen(false)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={createLab}>
                <div className="modal-body">
                  <div className="row g-3">
                    {[
                      ["Lab name", "labName", "text"],
                      ["Owner name", "ownerName", "text"],
                      ["Owner mobile", "mobileNumber", "tel"],
                      ["Lab mobile", "labMobileNumber", "tel"],
                      ["Email", "email", "email"],
                      ["Initial password", "password", "password"],
                    ].map(([label, field, type]) => (
                      <div className="col-md-6" key={field}>
                        <label className="form-label">
                          {label}
                          <input
                            className="form-control"
                            type={type}
                            value={labForm[field]}
                            onChange={(event) =>
                              setLabForm({
                                ...labForm,
                                [field]: [
                                  "mobileNumber",
                                  "labMobileNumber",
                                ].includes(field)
                                  ? event.target.value.replace(/\D/g, "")
                                  : event.target.value,
                              })
                            }
                            maxLength={type === "tel" ? 10 : undefined}
                            required
                          />
                        </label>
                      </div>
                    ))}

                    <div className="col-12">
                      <label className="form-check-label">
                        <input
                          className="form-check-input me-2"
                          type="checkbox"
                          checked={labForm.isActive}
                          onChange={(event) =>
                            setLabForm({
                              ...labForm,
                              isActive: event.target.checked,
                            })
                          }
                        />
                        Lab is active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-report btn-secondary"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-report btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      "Creating…"
                    ) : (
                      <>
                        <Plus size={16} /> Create lab
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function LabDetails({
  lab,
  counts,
  filter,
}) {
  const stats = [
    ["Total bookings", counts?.totalBookings],
    ["Reports", counts?.totalReports],
    ["Total tests", counts?.totalTests],
    ["Submitted tests", counts?.submittedTests],
    ["Pending tests", counts?.pendingTests],
    ["Configured tests", counts?.testsConfigured],
    ["Active sessions", counts?.activeSessions],
  ];

  const info = [
    ["Lab name", lab.labName],
    ["Owner", lab.ownerName],
    ["Owner mobile", lab.mobileNumber],
    ["Lab phone", lab.labMobileNumber],
    ["Email", lab.email],
    [
      "Created",
      lab.createdAt
        ? new Date(lab.createdAt).toLocaleDateString()
        : "—",
    ],
    ["Activity period", filter],
  ];

  return (
    <>
      <div className="row g-3 mb-4">
        {stats.map(([label, value]) => (
          <div className="col-6 col-lg-3" key={label}>
            <article className="report-header-section h-100 mb-0 p-4">
              <span className="d-block text-muted">{label}</span>
              <b className="d-block fs-2 text-dark">
                {value ?? "—"}
              </b>
            </article>
          </div>
        ))}
      </div>

      <table className="reports-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {info.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{value || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
