type PageLoaderProps = {
  label?: string;
};

const PageLoader = ({ label = "Loading, please wait..." }: PageLoaderProps) => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
    <span className="loading loading-spinner loading-lg text-primary" />
    <p className="text-sm font-medium text-base-content/70">{label}</p>
  </div>
);

export default PageLoader;
