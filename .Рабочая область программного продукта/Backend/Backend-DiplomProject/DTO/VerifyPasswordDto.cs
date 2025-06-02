namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Проверка верификации
    /// </summary>
    public class VerifyPasswordDto
    {
        public long Idusername { get; set; }

        public string Password { get; set; }
    }
}
