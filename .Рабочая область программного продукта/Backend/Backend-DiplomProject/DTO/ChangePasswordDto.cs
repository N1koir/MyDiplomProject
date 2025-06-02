namespace Backend_DiplomProject.DTO
{
    /// <summary>
    /// Изменение пароля
    /// </summary>
    public class ChangePasswordDto
    {
        public long UserId { get; set; }
        public string NewPassword { get; set; } = null!;
    }
}
