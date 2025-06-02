using Microsoft.Extensions.Logging;
using Backend_DiplomProject.DTO;
using Backend_DiplomProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Backend_DiplomProject.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        AppDbContext context,
        ILogger<AuthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login(LoginDto dto)
    {
        try
        {
            _logger.LogInformation($"Login attempt for user: {dto.Login}");

            var user = await _context.Usernames
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Login == dto.Login);

            if (user == null)
            {
                _logger.LogWarning($"User not found: {dto.Login}");
                return Unauthorized(new { message = "Invalid credentials" });
            }

            if (!VerifyPassword(dto.Password, user.Password))
            {
                _logger.LogWarning($"Password mismatch for user: {dto.Login}");
                return Unauthorized(new { message = "Invalid credentials" });
            }

            _logger.LogInformation($"Login successful for user: {dto.Login}");
            return Ok(new
            {
                idusername = user.Idusername,
                login = user.Login,
                idrole = user.Idrole
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Преобразовывает пароль из хеша
    /// </summary>
    /// <param name="inputPassword"></param>
    /// <param name="storedHash"></param>
    /// <returns></returns>
    private bool VerifyPassword(string inputPassword, string storedHash)
    {
        using var sha256 = SHA256.Create();
        var inputHash = Convert.ToHexString(
            sha256.ComputeHash(Encoding.UTF8.GetBytes(inputPassword)));

        return inputHash.Equals(storedHash, StringComparison.OrdinalIgnoreCase);
    }


    [HttpPost("register")]
    public async Task<ActionResult<object>> Register(RegisterDto dto)
    {
        if (await _context.Usernames.AnyAsync(u => u.Login == dto.Login))
            return BadRequest(new { message = "Username already exists" });

        var newUser = new Username
        {
            Login = dto.Login,
            Password = HashPassword(dto.Password),
            Dateaddaccount = DateTime.UtcNow.Date,
            Idrole = 2
        };

        _context.Usernames.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            idusername = newUser.Idusername,
            login = newUser.Login,
            idrole = newUser.Idrole
        });
    }

    /// <summary>
    /// Преобразовывает пароль в хеш
    /// </summary>
    /// <param name="password"></param>
    /// <returns></returns>
    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        return Convert.ToHexString(
            sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        try
        {
            foreach (var cookie in Request.Cookies.Keys)
            {
                Response.Cookies.Delete(cookie);
            }

            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Logout failed");
            return StatusCode(500, new { message = "Logout failed" });
        }
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        try
        {
            _logger.LogInformation($"Password change request for user: {dto.UserId}");

            var user = await _context.Usernames.FindAsync(dto.UserId);
            if (user == null)
            {
                _logger.LogWarning($"User not found: {dto.UserId}");
                return NotFound(new { message = "User not found" });
            }

            user.Password = HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password changed successfully for user: {dto.UserId}");
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password change failed");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Проверка верификации
    /// </summary>
    /// <param name="dto"></param>
    /// <returns></returns>
    [HttpPost("verify-password")]
    public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordDto dto)
    {
        // Попытаемся найти пользователя по Idusername
        var user = await _context.Usernames
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Idusername == dto.Idusername);

        if (user == null)
        {
            // Если вдруг пользователь не найден — считаем, что неверные данные
            return NotFound(new { success = false, message = "User not found" });
        }

        // Проверим хеш пароля
        bool passwordMatches = false;
        using (var sha256 = SHA256.Create())
        {
            var inputHash = Convert.ToHexString(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(dto.Password))
            );
            passwordMatches = inputHash.Equals(user.Password, StringComparison.OrdinalIgnoreCase);
        }

        return Ok(new { success = passwordMatches });
    }

}