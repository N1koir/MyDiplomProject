using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class UsernameController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsernameController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Username>>> GetUsers()
    {
        return await _context.Usernames
            .Include(u => u.Role)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Username>> GetUser(long id)
    {
        var user = await _context.Usernames
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Idusername == id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(long id, Username user)
    {
        if (id != user.Idusername) return BadRequest();

        _context.Entry(user).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        var user = await _context.Usernames.FindAsync(id);
        if (user == null) return NotFound();

        _context.Usernames.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}