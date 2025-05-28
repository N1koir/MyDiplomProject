namespace Backend_DiplomProject.DTO
{
    public class RegisterDto : LoginDto
    {
        public string Login { get; set; } = null!;
        public string Password { get; set; } = null!;
        public int Idrole { get; set; } = 2;
    }
}
