namespace Backend_DiplomProject.Models.SystemModels
{
    // Модель для страниц курса (соответствует таблице pages)
    public class PageFormData
    {
        public string Content { get; set; } // Будет сохраняться в file (BYTEA)
        public int Order { get; set; } // Соответствует numberpage
    }
}
