using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class AgePeopleController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgePeopleController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgePeople>>> GetAll()
        => await _context.AgePeoples.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<AgePeople>> GetById(int id)
    {
        var item = await _context.AgePeoples.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<AgePeople>> Create(AgePeople item)
    {
        _context.AgePeoples.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Idagepeople }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AgePeople item)
    {
        if (id != item.Idagepeople) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.AgePeoples.FindAsync(id);
        if (item == null) return NotFound();

        _context.AgePeoples.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
