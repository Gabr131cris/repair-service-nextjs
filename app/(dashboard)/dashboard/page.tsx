"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  PlusCircle,
  FileText,
  Settings,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  ReceiptText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { getFirebaseAuth, getDb, db } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import LiveConsole from "@/components/dashboard/LiveConsole";

interface Company {
  id: string;
  name?: string;
  legalName?: string;
  address?: string;
  city?: string;
  county?: string;
  phone?: string;
  email?: string;
  cif?: string;
  iban?: string;
  bankName?: string;
}

interface BillItem {
  id: string;
  createdAt?: any;
  createdBy?: string;
  form?: {
    calculatedTotal?: number;
    [key: string]: any;
  };
}

export default function DashboardHome() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [recentBills, setRecentBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<{
    todayTotal: number;
    monthTotal: number;
    monthBillsCount: number;
    lastBillDate: string | null;
  }>({
    todayTotal: 0,
    monthTotal: 0,
    monthBillsCount: 0,
    lastBillDate: null,
  });

  const [logs, setLogs] = useState<string[]>([]);

  // ✅ log helper (poți apela oriunde)
  const log = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    const prefix =
      type === "success"
        ? "✅ [SUCCESS]"
        : type === "error"
        ? "❌ [ERROR]"
        : "ℹ️ [INFO]";
    setLogs((prev) => [...prev, `${prefix} ${message}`]);
  };

  /* --------------------------------------------------
        LOAD USER, ROLE, COMPANY, BILLS & STATS
  --------------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const auth = await getFirebaseAuth();
        const currentUser = auth?.currentUser;
        const dbX = getDb();

        setUser(currentUser);
        log("Firebase Auth initialized", "success");

        const r = await getUserRole();
        setRole(r);
        log(`User role: ${r}`, "info");

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Dacă userul ține de o companie (company_admin / company_user)
        if (r === "company_admin" || r === "company_user") {
          // 1. aflăm companyId din companyUsers
          const userSnap = await getDoc(
            doc(dbX, "companyUsers", currentUser.uid)
          );

          const cid = userSnap.data()?.companyId as string | undefined;
          if (!cid) {
            log("Nu s-a găsit companyId pentru utilizator.", "error");
            setLoading(false);
            return;
          }

          setCompanyId(cid);
          log(`CompanyId găsit: ${cid}`, "success");

          // 2. citim compania
          const companySnap = await getDoc(doc(db, "companies", cid));
          if (companySnap.exists()) {
            const data = companySnap.data();
            setCompany({
              id: companySnap.id,
              name: data.name,
              legalName: data.legalName,
              address: data.address,
              city: data.city,
              county: data.county,
              phone: data.phone,
              email: data.email,
              cif: data.cif,
              iban: data.iban,
              bankName: data.bankName,
            });
            log("Date companie încărcate.", "success");
          } else {
            log("Compania asociată nu există în colecția companies.", "error");
          }

          // 3. citim facturile recente + stats
          const billsRef = collection(db, "companyBills", cid, "bills");
          const qBills = query(
            billsRef,
            orderBy("createdAt", "desc"),
            limit(50)
          );
          const snapBills = await getDocs(qBills);

          const items: BillItem[] = snapBills.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));

          setRecentBills(items.slice(0, 5));

          // Stats: total azi + luna curentă
          const now = new Date();
          const todayDay = now.getDate();
          const todayMonth = now.getMonth();
          const todayYear = now.getFullYear();

          let todayTotal = 0;
          let monthTotal = 0;
          let monthBillsCount = 0;
          let lastBillDate: Date | null = null;

          items.forEach((b) => {
            const ts = b.createdAt;
            const total = b.form?.calculatedTotal || 0;

            if (!ts?.toDate) return;
            const d: Date = ts.toDate();

            // azi
            if (
              d.getDate() === todayDay &&
              d.getMonth() === todayMonth &&
              d.getFullYear() === todayYear
            ) {
              todayTotal += total;
            }

            // luna curentă
            if (
              d.getMonth() === todayMonth &&
              d.getFullYear() === todayYear
            ) {
              monthTotal += total;
              monthBillsCount++;
            }

            // ultima factură
            if (!lastBillDate || d > lastBillDate) {
              lastBillDate = d;
            }
          });

          setStats({
            todayTotal,
            monthTotal,
            monthBillsCount,
            lastBillDate: lastBillDate
              ? lastBillDate.toLocaleString("ro-RO")
              : null,
          });

          log("Statistici facturi calculate.", "success");
        } else {
          // superadmin / alt rol – nu legăm de companie aici
          log(
            "Utilizator fără companie asociată (superadmin / alt rol).",
            "info"
          );
        }
      } catch (err: any) {
        console.error(err);
        log("Eroare la încărcarea dashboard-ului: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* --------------------------------------------------
        HELPERS
  --------------------------------------------------- */

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return "-";
    try {
      return ts.toDate().toLocaleString("ro-RO");
    } catch {
      return "-";
    }
  };

  /* --------------------------------------------------
        RENDER
  --------------------------------------------------- */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER — USER + ROLE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Bun venit în Dashboard 👋
          </h1>

          {user ? (
            <p className="text-gray-700">
              Salut,{" "}
              <span className="font-semibold text-blue-600">
                {user.displayName || user.email}
              </span>
              !
            </p>
          ) : (
            <p className="text-gray-500">
              Se încarcă datele utilizatorului...
            </p>
          )}

          {role && (
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
              Rol:{" "}
              <span className="font-semibold text-gray-800">{role}</span>
            </p>
          )}
        </div>

        {/* Mică badge / info ultima factură */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-800 max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} />
            <span className="font-semibold">
              Activitate recentă serviciu
            </span>
          </div>
          {stats.lastBillDate ? (
            <p>
              Ultima factură a fost creată la{" "}
              <span className="font-semibold">{stats.lastBillDate}</span>.
            </p>
          ) : (
            <p>Încă nu există facturi înregistrate pentru această companie.</p>
          )}
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
          Se încarcă datele dashboard-ului...
        </div>
      )}

      {!loading && (
        <>
          {/* COMPANY CARD + QUICK ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.3fr] gap-6">
            {/* COMPANY CARD */}
            <div className="bg-white p-6 rounded-lg shadow border space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {company?.name || "Companie neconfigurată"}
                </h2>
              </div>

              {company ? (
                <>
                  {company.legalName && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Legal:</span>{" "}
                      {company.legalName}
                    </p>
                  )}
                  {(company.address || company.city || company.county) && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Adresă:</span>{" "}
                      {company.address}{" "}
                      {company.city ? `, ${company.city}` : ""}{" "}
                      {company.county ? `, ${company.county}` : ""}
                    </p>
                  )}
                  {company.phone && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Telefon:</span>{" "}
                      {company.phone}
                    </p>
                  )}
                  {company.email && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span>{" "}
                      {company.email}
                    </p>
                  )}
                  {(company.cif || company.iban || company.bankName) && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date fiscale:</span>{" "}
                      {company.cif && `CIF: ${company.cif}`}
                      {company.iban && ` | IBAN: ${company.iban}`}
                      {company.bankName && ` | ${company.bankName}`}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-2">
                  <AlertCircle size={16} />
                  <span>
                    Nu există încă date pentru companie. Dacă ești
                    administrator, completează profilul companiei din meniul
                    „Editare Companie”.
                  </span>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Acțiuni rapide
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {companyId && (
                  <>
                    <QuickActionButton
                      label="Creează Factură"
                      icon={<PlusCircle size={18} />}
                      onClick={() =>
                        router.push(
                          `/dashboard/company/${companyId}/create-bill`
                        )
                      }
                    />
                    <QuickActionButton
                      label="Facturile Mele"
                      icon={<FileText size={18} />}
                      onClick={() =>
                        router.push(`/dashboard/company/${companyId}/stats`)
                      }
                    />
                    <QuickActionButton
                      label="Setări Prețuri"
                      icon={<ReceiptText size={18} />}
                      onClick={() =>
                        router.push(
                          `/dashboard/company/${companyId}/bill-prices`
                        )
                      }
                    />
                    <QuickActionButton
                      label="Utilizatori Companie"
                      icon={<Users size={18} />}
                      onClick={() =>
                        router.push(
                          `/dashboard/company/${companyId}/admin/users`
                        )
                      }
                    />
                  </>
                )}

                {/* fallback pt superadmin fără companyId */}
                {!companyId && (
                  <QuickActionButton
                    label="Administrează companii"
                    icon={<Settings size={18} />}
                    onClick={() =>
                      router.push("/dashboard/superadmin/companies")
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* STATISTICI SCURTE */}
          {companyId && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DashboardStat
                label="Total azi"
                value={formatCurrency(stats.todayTotal)}
                icon={<Calendar size={18} />}
              />
              <DashboardStat
                label="Total luna aceasta"
                value={formatCurrency(stats.monthTotal)}
                icon={<TrendingUp size={18} />}
              />
              <DashboardStat
                label="Facturi luna aceasta"
                value={stats.monthBillsCount.toString()}
                icon={<FileText size={18} />}
              />
              <DashboardStat
                label="Ultima factură"
                value={stats.lastBillDate || "-"}
                small
                icon={<ReceiptText size={18} />}
              />
            </div>
          )}

          {/* RECENT BILLS + CONSOLE */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">
            {/* RECENT BILLS TABLE */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Ultimele facturi
                </h2>
                {companyId && (
                  <button
                    onClick={() =>
                      router.push(`/dashboard/company/${companyId}/stats`)
                    }
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    Vezi toate
                    <span>
                      <ArrowRight size={14} />
                    </span>
                  </button>
                )}
              </div>

              {recentBills.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nu există încă facturi înregistrate.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-2 text-left">Dată</th>
                        <th className="p-2 text-left">Creată de</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBills.map((bill) => (
                        <tr
                          key={bill.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-2">{formatDate(bill.createdAt)}</td>
                          <td className="p-2">{bill.createdBy || "-"}</td>
                          <td className="p-2 text-right font-semibold">
                            {formatCurrency(
                              bill.form?.calculatedTotal || 0
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {companyId && (
                              <button
                                onClick={() =>
                                  window.open(
                                    `/print/${companyId}/${bill.id}`,
                                    "_blank"
                                  )
                                }
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Deschide
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* LIVE CONSOLE */}
            <div className="bg-white p-4 rounded-lg shadow border flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <span>Consolă live</span>
              </h2>
              <div className="flex-1 min-h-[220px]">
                <LiveConsole logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------
    SMALL UI COMPONENTS
--------------------------------------------------- */

function DashboardStat({
  label,
  value,
  icon,
  small = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center gap-3">
      {icon && (
        <div className="p-2 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <span
          className={`font-semibold text-gray-800 ${
            small ? "text-xs mt-1" : "text-lg"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function QuickActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1 border rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition text-left"
    >
      <div className="flex items-center gap-2 text-gray-800">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </button>
  );
}
