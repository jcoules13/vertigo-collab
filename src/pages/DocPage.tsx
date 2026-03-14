export default function DocPage() {
  return (
    <div className="-m-4 lg:-m-8" style={{ height: 'calc(100vh - 1px)' }}>
      <iframe
        src="/doc-embed"
        className="w-full h-full border-0"
        title="Assistant Doc"
        allow="camera; microphone"
      />
    </div>
  )
}
