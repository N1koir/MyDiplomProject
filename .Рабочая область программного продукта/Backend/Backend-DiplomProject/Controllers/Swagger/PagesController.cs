using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class PagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public PagesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{courseId}")]
    public async Task<ActionResult<IEnumerable<Pages>>> GetPages(long courseId)
    {
        return await _context.Pages
            .Where(p => p.Idcourse == courseId)
            .ToListAsync();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePage(long id, Pages page)
    {
        if (id != page.Idpages) return BadRequest();

        _context.Entry(page).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePage(long id)
    {
        var page = await _context.Pages.FindAsync(id);
        if (page == null) return NotFound();

        _context.Pages.Remove(page);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}