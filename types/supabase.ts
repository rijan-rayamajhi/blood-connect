
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'hospital' | 'blood_bank';
          created_at: string;
        }
      }
      // Add other tables as we design them
    }
  }
}
