-- Tax Declarations Table
CREATE TABLE IF NOT EXISTS tax_declarations (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  financial_year VARCHAR(10) NOT NULL,
  declaration_type VARCHAR(50) NOT NULL CHECK (declaration_type IN ('hra', 'section_80c', 'section_80d', 'home_loan', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  proof_document TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_employee ON tax_declarations(employee_id);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_status ON tax_declarations(status);
CREATE INDEX IF NOT EXISTS idx_tax_declarations_financial_year ON tax_declarations(financial_year);

