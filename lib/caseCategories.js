export const CATEGORY_LABEL = {
  criminal_law: 'Criminal Law',
  civil_litigation: 'Civil Litigation',
  family_law: 'Family Law',
  corporate_business: 'Corporate & Business Law',
  employment_labor: 'Employment & Labor Law',
  immigration: 'Immigration Law',
  real_estate: 'Real Estate Law',
  estate_planning_probate: 'Estate Planning & Probate',
  bankruptcy: 'Bankruptcy Law',
  tax_law: 'Tax Law',
  constitutional_civil_rights: 'Constitutional & Civil Rights',
  administrative_law: 'Administrative Law',
  environmental_law: 'Environmental Law',
  education_law: 'Education Law'
};

export const CATEGORY_TYPES = {
  criminal_law: ['Felony', 'Misdemeanor', 'DUI/DWI', 'Drug Offenses', 'White-Collar Crime', 'Domestic Violence', 'Juvenile Delinquency', 'Weapons Charges', 'Assault & Battery', 'Theft & Burglary', 'Expungement', 'Criminal Appeals'],
  civil_litigation: ['Personal Injury', 'Medical Malpractice', 'Wrongful Death', 'Product Liability', 'Premises Liability', 'Defamation', 'Breach of Contract', 'Property Damage', 'Debt Collection', 'Construction Disputes', 'Insurance Claims', 'Class Action'],
  family_law: ['Divorce (Contested)', 'Divorce (Uncontested)', 'Child Custody', 'Child Support', 'Spousal Support/Alimony', 'Adoption', 'Paternity', 'Guardianship', 'Domestic Violence (Family Court)', 'Prenuptial Agreement', 'Name Change', 'Juvenile Dependency'],
  corporate_business: ['Business Formation', 'Contract Disputes', 'Shareholder Disputes', 'Partnership Disputes', 'Mergers & Acquisitions', 'Securities Fraud', 'IP (Trademark)', 'IP (Copyright)', 'IP (Patent)', 'Antitrust', 'Commercial Litigation'],
  employment_labor: ['Wrongful Termination', 'Workplace Discrimination', 'Sexual Harassment', 'Wage & Hour Disputes', "Workers' Compensation", 'Labor Union Disputes', 'Employment Contract Disputes', 'Whistleblower Claims'],
  immigration: ['Visa Application', 'Green Card/Permanent Residency', 'Citizenship/Naturalization', 'Deportation Defense', 'Asylum', 'Work Permits', 'Family-Based Immigration', 'Business Immigration', 'DACA'],
  real_estate: ['Property Transactions', 'Title Disputes', 'Boundary Disputes', 'Zoning & Land Use', 'Foreclosure', 'Eminent Domain', 'HOA Disputes', 'Commercial Leasing', 'Eviction (Landlord-Tenant)'],
  estate_planning_probate: ['Will Drafting', 'Trust Creation', 'Probate Administration', 'Estate Disputes', 'Power of Attorney', 'Conservatorship', 'Elder Law', 'Estate Tax Planning'],
  bankruptcy: ['Chapter 7 (Liquidation)', 'Chapter 11 (Reorganization)', "Chapter 13 (Wage Earner's Plan)", 'Creditor Harassment', 'Foreclosure Defense'],
  tax_law: ['IRS Audit Defense', 'Tax Fraud', 'Tax Disputes', 'International Tax', 'Payroll Tax Issues'],
  constitutional_civil_rights: ['Civil Rights Violations', 'First Amendment', 'Discrimination (Government)', 'Police Misconduct', 'Due Process Violations'],
  administrative_law: ['Licensing Disputes', 'Regulatory Compliance', 'Government Agency Disputes'],
  environmental_law: ['Environmental Compliance', 'Pollution Claims', 'Land Use Disputes'],
  education_law: ['Student Rights', 'Special Education', 'School Discipline', 'Title IX']
};

export const CASE_CATEGORIES = Object.keys(CATEGORY_TYPES).map((value) => ({ value, label: CATEGORY_LABEL[value] }));

export const ALL_TYPES = Object.values(CATEGORY_TYPES).flat();

export const CATEGORY_BADGE = {
  criminal_law: 'bg-red-50 text-red-700 border-red-200',
  civil_litigation: 'bg-blue-50 text-blue-700 border-blue-200',
  family_law: 'bg-violet-50 text-violet-700 border-violet-200',
  corporate_business: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  employment_labor: 'bg-orange-50 text-orange-700 border-orange-200',
  immigration: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  real_estate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  estate_planning_probate: 'bg-amber-50 text-amber-700 border-amber-200',
  bankruptcy: 'bg-rose-50 text-rose-700 border-rose-200',
  tax_law: 'bg-lime-50 text-lime-700 border-lime-200',
  constitutional_civil_rights: 'bg-purple-50 text-purple-700 border-purple-200',
  administrative_law: 'bg-slate-50 text-slate-700 border-slate-200',
  environmental_law: 'bg-teal-50 text-teal-700 border-teal-200',
  education_law: 'bg-pink-50 text-pink-700 border-pink-200'
};