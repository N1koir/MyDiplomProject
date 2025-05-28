namespace Backend_DiplomProject.DTO
{
    public class ChangePasswordDto
    {
        public long UserId { get; set; }
        public string NewPassword { get; set; } = null!;
    }
}
