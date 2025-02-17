<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 overflow-x-auto">
  {insights.map((insight, index) => (
    <div
      key={index}
      className="flex flex-col p-4 bg-card rounded-lg border min-w-[200px]"
    >
      <div className="text-sm font-medium text-muted-foreground">
        {insight.label}
      </div>
      <div className="text-2xl font-bold mt-1">
        {insight.value}
      </div>
    </div>
  ))}
</div> 