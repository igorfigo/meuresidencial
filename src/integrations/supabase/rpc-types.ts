
export interface SupabaseRPCTypes {
  create_storage_bucket: {
    args: {
      bucket_name: string;
      bucket_public: boolean;
    };
    returns: void;
  };
}
