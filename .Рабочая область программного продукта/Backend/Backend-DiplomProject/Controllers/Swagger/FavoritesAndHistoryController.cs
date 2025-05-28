using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_DiplomProject.Models;
using Backend_DiplomProject;

namespace Backend_DiplomProject.Controllers.Swagger;

[Route("api/[controller]")]
[ApiController]
public class FavoritesAndHistoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesAndHistoryController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FavoritesAndHistory>>> GetAll()
        => await _context.FavoritesAndHistories.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<FavoritesAndHistory>> GetById(int id)
    {
        var item = await _context.FavoritesAndHistories.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<FavoritesAndHistory>> Create(FavoritesAndHistory item)
    {
        _context.FavoritesAndHistories.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Idfavoritesandhistory }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, FavoritesAndHistory item)
    {
        if (id != item.Idfavoritesandhistory) return BadRequest();

        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.FavoritesAndHistories.FindAsync(id);
        if (item == null) return NotFound();

        _context.FavoritesAndHistories.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}