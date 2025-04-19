
else {
  return (
    <div className={`flex flex-col ${isMobile ? "" : ""}`}>
      <h1 className={`text-2xl font-bold tracking-tight ${isMobile ? "text-xl" : ""}`}>
        Olá {user?.nome || 'Representante'}
      </h1>
      <p className={`text-muted-foreground text-sm ${isMobile ? "mt-1 text-sm" : "hidden"}`}>
        {user?.nomeCondominio || 'Condomínio'}
      </p>
    </div>
  );
}
