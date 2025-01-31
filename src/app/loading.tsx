import { Loader } from "lucide-react";

const loading = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader className="size-5 animate-spin transition-all" />
    </div>
  );
};

export default loading;
