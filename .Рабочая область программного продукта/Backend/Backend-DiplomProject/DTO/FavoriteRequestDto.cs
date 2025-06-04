namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Добавление и изменений/создание избранного
    /// </summary>
    public class FavoriteRequestDto
    {
        public long Idusername { get; set; }
        public long Idcourse { get; set; }
        public int Viewed { get; set; }
    }
}
