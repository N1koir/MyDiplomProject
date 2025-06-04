namespace Backend_DiplomProject.DTO
{
   /// <summary>
   /// Отдача списка избранных
   /// </summary>
    public class FavoriteDto
    {
        public long Idcourse { get; set; }
        public int Viewed { get; set; }
    }
}